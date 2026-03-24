using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly Context _context;
        private readonly ICouponService _couponService;
        private readonly IPaymentService _paymentService;
        private readonly LogService _logService;

        public SubscriptionService(
            Context context,
            ICouponService couponService,
            IPaymentService paymentService,
            LogService logService)
        {
            _context = context;
            _couponService = couponService;
            _paymentService = paymentService;
            _logService = logService;
        }

        // Paket Listesi
        public async Task<List<SubscriptionPlan>> GetAvailablePlansAsync()
        {
            return await _context.SubscriptionPlans
                .Where(p => p.IsActive == true)
                .OrderBy(p => p.MonthlyPrice)
                .ToListAsync();
        }

        public async Task<SubscriptionPlan?> GetPlanByIdAsync(int planId)
        {
            return await _context.SubscriptionPlans.FindAsync(planId);
        }

        // Mevcut Abonelik Bilgisi
        public async Task<CurrentSubscriptionDto?> GetCurrentSubscriptionAsync(int tenantId)
        {
            var subscription = await _context.TenantSubscriptions
                .Include(s => s.SubscriptionPlan)
                .Where(s => s.TenantId == tenantId && s.IsActive == true)
                .FirstOrDefaultAsync();

            if (subscription == null) return null;

            var daysRemaining = (subscription.EndDate - DateTime.Now).Days;

            return new CurrentSubscriptionDto
            {
                Id            = subscription.Id,
                PlanName      = subscription.SubscriptionPlan.Name,
                PriceSold     = subscription.PriceSold,
                StartDate     = subscription.StartDate,
                EndDate       = subscription.EndDate,
                IsTrialPeriod = subscription.IsTrialPeriod,
                TrialEndDate  = subscription.TrialEndDate,
                AutoRenew     = subscription.AutoRenew,
                PaymentStatus = subscription.PaymentStatus,
                DaysRemaining = daysRemaining > 0 ? daysRemaining : 0,
                IsActive      = subscription.IsActive
            };
        }

        public async Task<bool> IsSubscriptionActiveAsync(int tenantId)
        {
            var subscription = await _context.TenantSubscriptions
                .Where(s => s.TenantId == tenantId && s.IsActive == true)
                .FirstOrDefaultAsync();

            if (subscription == null) return false;

            if (subscription.IsTrialPeriod)
            {
                if (subscription.TrialEndDate.HasValue && subscription.TrialEndDate.Value < DateTime.Now)
                    return false;
                return true;
            }

            if (subscription.EndDate < DateTime.Now)
            {
                if (subscription.IsInGracePeriod && subscription.GracePeriodEndDate.HasValue)
                    return subscription.GracePeriodEndDate.Value >= DateTime.Now;
                return false;
            }

            return subscription.PaymentStatus == "Paid";
        }

        public async Task<bool> IsInTrialPeriodAsync(int tenantId)
        {
            var subscription = await _context.TenantSubscriptions
                .Where(s => s.TenantId == tenantId && s.IsActive == true)
                .FirstOrDefaultAsync();

            if (subscription == null) return false;

            return subscription.IsTrialPeriod &&
                   subscription.TrialEndDate.HasValue &&
                   subscription.TrialEndDate.Value >= DateTime.Now;
        }

        // Abonelik Satin Alma - userIp PayTR icin zorunlu
        public async Task<SubscriptionPurchaseResultDto> PurchaseSubscriptionAsync(
            int tenantId, SubscriptionPurchaseDto dto, string userIp)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                var plan = await GetPlanByIdAsync(dto.SubscriptionPlanId);
                if (plan == null)
                    throw new Exception("PLAN_NOT_FOUND|Secilen paket bulunamadi.");

                var originalPrice = dto.IsYearly ? plan.YearlyPrice : plan.MonthlyPrice;
                decimal finalPrice = originalPrice;
                decimal? discountAmount = null;
                int? couponId = null;

                if (!string.IsNullOrEmpty(dto.CouponCode))
                {
                    var couponValidation = await _couponService.ValidateCouponAsync(
                        dto.CouponCode, tenantId, originalPrice);

                    if (!couponValidation.IsValid)
                        throw new Exception($"INVALID_COUPON|{couponValidation.Message}");

                    discountAmount = couponValidation.DiscountAmount;
                    finalPrice     = originalPrice - (discountAmount ?? 0);

                    var coupon = await _context.Coupons
                        .FirstOrDefaultAsync(c => c.Code == dto.CouponCode);
                    couponId = coupon?.Id;
                }

                var existingSubscriptions = await _context.TenantSubscriptions
                    .Where(s => s.TenantId == tenantId && s.IsActive == true)
                    .ToListAsync();

                foreach (var sub in existingSubscriptions)
                {
                    sub.IsActive = false;
                    sub.UDate    = DateTime.Now;
                }

                var subscription = new TenantSubscription
                {
                    TenantId           = tenantId,
                    SubscriptionPlanId = plan.Id,
                    PriceSold          = originalPrice,
                    StartDate          = DateTime.Now,
                    EndDate            = dto.IsYearly
                        ? DateTime.Now.AddYears(1)
                        : DateTime.Now.AddMonths(1),
                    IsTrialPeriod      = false,
                    AutoRenew          = true,
                    NextRenewalDate    = dto.IsYearly
                        ? DateTime.Now.AddYears(1)
                        : DateTime.Now.AddMonths(1),
                    PaymentStatus      = "Pending",
                    IsActive           = false, // Odeme gelince true olacak
                    CouponId           = couponId,
                    DiscountAmount     = discountAmount,
                    CDate              = DateTime.Now
                };

                _context.TenantSubscriptions.Add(subscription);
                await _context.SaveChangesAsync();

                if (couponId.HasValue)
                {
                    await _couponService.UseCouponAsync(
                        dto.CouponCode!, tenantId, subscription.Id, originalPrice);
                }

                // Kupon ile bedelsiz ise PayTR'yi atla, direkt aktifleştir
                if (finalPrice <= 0)
                {
                    subscription.IsActive      = true;
                    subscription.PaymentStatus = "Paid";
                    await _context.SaveChangesAsync();
                    await tx.CommitAsync();

                    return new SubscriptionPurchaseResultDto
                    {
                        SubscriptionId = subscription.Id,
                        OriginalPrice  = originalPrice,
                        DiscountAmount = discountAmount,
                        FinalPrice     = 0,
                        IframeToken    = "",
                        IframeUrl      = "",
                        MerchantOid    = "",
                        IsTrialPeriod  = false
                    };
                }

                // PayTR IFRAME token al
                var paymentResult = await _paymentService.InitializePaymentAsync(
                    tenantId, subscription.Id, finalPrice, userIp);

                await tx.CommitAsync();

                return new SubscriptionPurchaseResultDto
                {
                    SubscriptionId = subscription.Id,
                    OriginalPrice  = originalPrice,
                    DiscountAmount = discountAmount,
                    FinalPrice     = finalPrice,
                    IframeToken    = paymentResult.IframeToken,
                    IframeUrl      = paymentResult.IframeUrl,
                    MerchantOid    = paymentResult.MerchantOid,
                    IsTrialPeriod  = false
                };
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception  = ex,
                    LogLevel   = LogLevel.Error,
                    StatusCode = 500,
                    Action     = nameof(PurchaseSubscriptionAsync),
                    Controller = nameof(SubscriptionService),
                    Endpoint   = "SubscriptionService.PurchaseSubscriptionAsync",
                    Timestamp  = DateTime.Now,
                    UserId     = null
                });
                throw;
            }
        }

        public async Task<bool> ActivateSubscriptionAsync(int subscriptionId, string payTrReferenceNo)
        {
            var subscription = await _context.TenantSubscriptions.FindAsync(subscriptionId);
            if (subscription == null) return false;

            subscription.IsActive             = true;
            subscription.PaymentStatus        = "Paid";
            subscription.PaymentTransactionId = payTrReferenceNo;
            subscription.UDate                = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        // Deneme Suresi (3 gun ucretsiz)
        public async Task<TenantSubscription> CreateTrialSubscriptionAsync(int tenantId, int planId)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                var plan = await GetPlanByIdAsync(planId);
                if (plan == null)
                    throw new Exception("PLAN_NOT_FOUND|Plan bulunamadi.");

                var hasActiveSubscription = await _context.TenantSubscriptions
                    .AnyAsync(s => s.TenantId == tenantId && s.IsActive == true);

                if (hasActiveSubscription)
                    throw new Exception("ACTIVE_SUBSCRIPTION_EXISTS|Zaten aktif bir aboneliginiz var.");

                var hasUsedTrial = await _context.TenantSubscriptions
                    .AnyAsync(s => s.TenantId == tenantId && s.IsTrialPeriod == true);

                if (hasUsedTrial)
                    throw new Exception("TRIAL_ALREADY_USED|Deneme suresi daha once kullanilmis.");

                var trialEndDate = DateTime.Now.AddDays(3);

                var subscription = new TenantSubscription
                {
                    TenantId           = tenantId,
                    SubscriptionPlanId = planId,
                    PriceSold          = 0,
                    StartDate          = DateTime.Now,
                    EndDate            = trialEndDate,
                    IsTrialPeriod      = true,
                    TrialEndDate       = trialEndDate,
                    AutoRenew          = true,
                    NextRenewalDate    = trialEndDate,
                    PaymentStatus      = "Paid",
                    IsActive           = true,
                    CDate              = DateTime.Now
                };

                _context.TenantSubscriptions.Add(subscription);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                return subscription;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        // Abonelik Iptal
        public async Task<bool> CancelSubscriptionAsync(int tenantId, CancelSubscriptionDto dto)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                var subscription = await _context.TenantSubscriptions
                    .Where(s => s.TenantId == tenantId && s.IsActive == true)
                    .FirstOrDefaultAsync();

                if (subscription == null)
                    throw new Exception("NO_ACTIVE_SUBSCRIPTION|Aktif abonelik bulunamadi.");

                subscription.IsCancelled   = true;
                subscription.CancelledDate = DateTime.Now;
                subscription.CancelReason  = dto.Reason;
                subscription.AutoRenew     = false;
                subscription.UDate         = DateTime.Now;

                if (dto.RequestRefund && subscription.PaymentStatus == "Paid")
                {
                    var refundResult = await _paymentService.ProcessRefundAsync(
                        subscription.Id,
                        subscription.PriceSold,
                        dto.Reason);

                    if (refundResult.Success)
                    {
                        subscription.IsActive     = false;
                        subscription.IsRefunded   = true;
                        subscription.RefundAmount = subscription.PriceSold;
                        subscription.RefundDate   = DateTime.Now;
                    }
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                return true;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> ProcessRefundAsync(int subscriptionId, decimal refundAmount, string reason)
        {
            var subscription = await _context.TenantSubscriptions.FindAsync(subscriptionId);
            if (subscription == null) return false;

            var refundResult = await _paymentService.ProcessRefundAsync(
                subscriptionId, refundAmount, reason);

            if (refundResult.Success)
            {
                subscription.IsRefunded    = true;
                subscription.RefundAmount  = refundAmount;
                subscription.RefundDate    = DateTime.Now;
                subscription.PaymentStatus = "Refunded";
                subscription.UDate         = DateTime.Now;

                await _context.SaveChangesAsync();
            }

            return refundResult.Success;
        }

        // Odeme Gecmisi
        public async Task<List<PaymentHistoryDto>> GetPaymentHistoryAsync(int tenantId)
        {
            return await _context.TenantPaymentHistories
                .Where(ph => ph.TenantId == tenantId && ph.IsActive == true)
                .OrderByDescending(ph => ph.PaymentDate)
                .Select(ph => new PaymentHistoryDto
                {
                    Id            = ph.Id,
                    Amount        = ph.Amount,
                    PaymentDate   = ph.PaymentDate,
                    PaymentStatus = ph.PaymentStatus,
                    PaymentMethod = ph.PaymentMethod,
                    Description   = ph.Description,
                    MerchantOid   = ph.TransactionId,
                    IsRefunded    = ph.IsRefunded,
                    RefundAmount  = ph.RefundAmount,
                    RefundDate    = ph.RefundDate,
                    RefundReason  = ph.RefundReason
                })
                .ToListAsync();
        }

        // Otomatik Yenileme
        public async Task<bool> RenewSubscriptionAsync(int tenantId)
        {
            var subscription = await _context.TenantSubscriptions
                .Include(s => s.SubscriptionPlan)
                .Where(s => s.TenantId == tenantId && s.IsActive == true)
                .FirstOrDefaultAsync();

            if (subscription == null || !subscription.AutoRenew) return false;

            var dto = new SubscriptionPurchaseDto
            {
                SubscriptionPlanId = subscription.SubscriptionPlanId,
                IsYearly           = (subscription.EndDate - subscription.StartDate).Days > 32,
                CouponCode         = null
            };

            try
            {
                await PurchaseSubscriptionAsync(tenantId, dto, "127.0.0.1");
                return true;
            }
            catch
            {
                await StartGracePeriodAsync(subscription.Id);
                return false;
            }
        }

        public async Task<List<TenantSubscription>> GetSubscriptionsDueForRenewalAsync()
        {
            var tomorrow = DateTime.Now.AddDays(1).Date;

            return await _context.TenantSubscriptions
                .Where(s => s.IsActive == true &&
                           s.AutoRenew == true &&
                           s.NextRenewalDate.HasValue &&
                           s.NextRenewalDate.Value.Date == tomorrow)
                .ToListAsync();
        }

        // Grace Period
        public async Task<bool> StartGracePeriodAsync(int subscriptionId)
        {
            var subscription = await _context.TenantSubscriptions.FindAsync(subscriptionId);
            if (subscription == null) return false;

            subscription.IsInGracePeriod       = true;
            subscription.GracePeriodEndDate    = DateTime.Now.AddDays(3);
            subscription.FailedPaymentAttempts += 1;
            subscription.UDate                 = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EndGracePeriodAsync(int subscriptionId, bool success)
        {
            var subscription = await _context.TenantSubscriptions.FindAsync(subscriptionId);
            if (subscription == null) return false;

            subscription.IsInGracePeriod    = false;
            subscription.GracePeriodEndDate = null;

            if (success)
            {
                subscription.FailedPaymentAttempts = 0;
                subscription.PaymentStatus         = "Paid";
            }
            else
            {
                subscription.IsActive      = false;
                subscription.PaymentStatus = "Failed";
            }

            subscription.UDate = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        // ================================================================
        //  PAKET LİMİT KONTROLLERİ
        // ================================================================

        /// <summary>
        /// Tenant için geçerli planı döner.
        /// Deneme süresindeyse Gold paket limitleri uygulanır (MaxStaff=20, MaxBranch=3).
        /// </summary>
        public async Task<SubscriptionPlan?> GetEffectivePlanAsync(int tenantId)
        {
            var subscription = await _context.TenantSubscriptions
                .Include(s => s.SubscriptionPlan)
                .Where(s => s.TenantId == tenantId && s.IsActive == true)
                .FirstOrDefaultAsync();

            if (subscription == null) return null;

            // Deneme süresindeyse Gold paket limitleri uygula
            if (subscription.IsTrialPeriod)
            {
                // Gold paketini bul, yoksa varsayılan Gold limitleri oluştur
                var goldPlan = await _context.SubscriptionPlans
                    .FirstOrDefaultAsync(p => p.Name.Contains("Gold") && p.IsActive == true);

                if (goldPlan != null) return goldPlan;

                // Gold plan bulunamazsa varsayılan Gold limitleri
                return new SubscriptionPlan
                {
                    Name = "Gold (Deneme)",
                    MaxStaffCount = 20,
                    MaxBranchCount = 3,
                    HasSmsIntegration = true,
                    HasWhatsappIntegration = true,
                    HasSocialMediaIntegration = false,
                    HasAiFeatures = false
                };
            }

            return subscription.SubscriptionPlan;
        }

        /// <summary>
        /// Tenant'ın personel ekleme limitine ulaşıp ulaşmadığını kontrol eder.
        /// </summary>
        public async Task<(bool canAdd, int currentCount, int maxCount, string? errorMessage)> CanAddStaffAsync(int tenantId)
        {
            var plan = await GetEffectivePlanAsync(tenantId);
            if (plan == null)
                return (false, 0, 0, "Aktif aboneliğiniz bulunmuyor. Lütfen bir plan satın alın.");

            // -1 veya 0 = sınırsız
            if (plan.MaxStaffCount <= 0)
                return (true, 0, -1, null);

            var currentStaffCount = await _context.Users
                .Where(u => u.TenantId == tenantId && u.IsActive == true)
                .CountAsync();

            if (currentStaffCount >= plan.MaxStaffCount)
            {
                return (false, currentStaffCount, plan.MaxStaffCount,
                    $"Paket limitinize ulaştınız ({currentStaffCount}/{plan.MaxStaffCount} personel). Daha fazla personel eklemek için paketinizi yükseltmeniz gerekmektedir.");
            }

            return (true, currentStaffCount, plan.MaxStaffCount, null);
        }

        // ================================================================
        //  ADMIN: PAKET YÖNETİMİ
        // ================================================================

        /// <summary>
        /// Tüm planları listeler (aktif/pasif dahil). SuperAdmin için.
        /// </summary>
        public async Task<List<SubscriptionPlan>> GetAllPlansAsync()
        {
            return await _context.SubscriptionPlans
                .OrderBy(p => p.MonthlyPrice)
                .ToListAsync();
        }

        /// <summary>
        /// Planı günceller. SuperAdmin için.
        /// </summary>
        public async Task<SubscriptionPlan?> UpdatePlanAsync(int planId, SubscriptionPlan updatedPlan)
        {
            var plan = await _context.SubscriptionPlans.FindAsync(planId);
            if (plan == null) return null;

            plan.Name = updatedPlan.Name;
            plan.Description = updatedPlan.Description;
            plan.MonthlyPrice = updatedPlan.MonthlyPrice;
            plan.YearlyPrice = updatedPlan.YearlyPrice;
            plan.MaxStaffCount = updatedPlan.MaxStaffCount;
            plan.MaxBranchCount = updatedPlan.MaxBranchCount;
            plan.HasSmsIntegration = updatedPlan.HasSmsIntegration;
            plan.HasWhatsappIntegration = updatedPlan.HasWhatsappIntegration;
            plan.HasSocialMediaIntegration = updatedPlan.HasSocialMediaIntegration;
            plan.HasAiFeatures = updatedPlan.HasAiFeatures;
            plan.Features = updatedPlan.Features;
            plan.ValidityMonths = updatedPlan.ValidityMonths;
            plan.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return plan;
        }

        /// <summary>
        /// Plan aktif/pasif durumunu değiştirir. SuperAdmin için.
        /// </summary>
        public async Task<bool> TogglePlanStatusAsync(int planId)
        {
            var plan = await _context.SubscriptionPlans.FindAsync(planId);
            if (plan == null) return false;

            plan.IsActive = !(plan.IsActive ?? true);
            plan.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
