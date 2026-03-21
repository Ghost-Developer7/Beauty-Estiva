using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class CouponService : ICouponService
    {
        private readonly Context _context;
        private readonly LogService _logService;

        public CouponService(Context context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        // Kupon Doğrulama
        public async Task<CouponValidationResultDto> ValidateCouponAsync(
            string code, int tenantId, decimal originalPrice)
        {
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code == code && c.IsActive == true);

            if (coupon == null)
            {
                return new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "Kupon kodu bulunamadı.",
                    DiscountAmount = null,
                    IsPercentage = false
                };
            }

            // Geçerlilik tarihi kontrolü
            if (DateTime.Now < coupon.StartDate || DateTime.Now > coupon.EndDate)
            {
                return new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "Kupon kodu süresi dolmuş veya henüz başlamamış.",
                    DiscountAmount = null,
                    IsPercentage = false
                };
            }

            // Kullanım limiti kontrolü
            if (coupon.MaxUsageCount.HasValue && 
                coupon.CurrentUsageCount >= coupon.MaxUsageCount.Value)
            {
                return new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "Kupon kullanım limiti dolmuş.",
                    DiscountAmount = null,
                    IsPercentage = false
                };
            }

            // Tenant kontrolü (belirli tenant'a özel mi?)
            if (!coupon.IsGlobal && coupon.SpecificTenantId.HasValue)
            {
                if (coupon.SpecificTenantId.Value != tenantId)
                {
                    return new CouponValidationResultDto
                    {
                        IsValid = false,
                        Message = "Bu kupon sizin için geçerli değil.",
                        DiscountAmount = null,
                        IsPercentage = false
                    };
                }
            }

            // Tenant daha önce bu kuponu kullanmış mı?
            var hasUsed = await HasTenantUsedCouponAsync(coupon.Id, tenantId);
            if (hasUsed)
            {
                return new CouponValidationResultDto
                {
                    IsValid = false,
                    Message = "Bu kuponu daha önce kullandınız. Bir kupon sadece bir kez kullanılabilir.",
                    DiscountAmount = null,
                    IsPercentage = false
                };
            }

            // İndirim miktarını hesapla
            decimal discountAmount;
            if (coupon.IsPercentage)
            {
                discountAmount = (originalPrice * coupon.DiscountAmount) / 100;
            }
            else
            {
                discountAmount = coupon.DiscountAmount;
            }

            // İndirim tutarı orijinal fiyattan fazla olamaz
            if (discountAmount > originalPrice)
            {
                discountAmount = originalPrice;
            }

            return new CouponValidationResultDto
            {
                IsValid = true,
                Message = "Kupon geçerli.",
                DiscountAmount = discountAmount,
                IsPercentage = coupon.IsPercentage
            };
        }

        // Kupon Kullanımı
        public async Task<CouponUsage> UseCouponAsync(
            string code, int tenantId, int subscriptionId, decimal originalPrice)
        {
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code == code);

            if (coupon == null)
                throw new Exception("COUPON_NOT_FOUND|Kupon bulunamadı.");

            // İndirim miktarını hesapla
            decimal discountAmount;
            if (coupon.IsPercentage)
            {
                discountAmount = (originalPrice * coupon.DiscountAmount) / 100;
            }
            else
            {
                discountAmount = coupon.DiscountAmount;
            }

            if (discountAmount > originalPrice)
            {
                discountAmount = originalPrice;
            }

            var finalPrice = originalPrice - discountAmount;

            // Kullanım kaydı oluştur
            var usage = new CouponUsage
            {
                CouponId = coupon.Id,
                TenantId = tenantId,
                SubscriptionId = subscriptionId,
                OriginalPrice = originalPrice,
                DiscountAmount = discountAmount,
                FinalPrice = finalPrice,
                UsedDate = DateTime.Now,
                CDate = DateTime.Now,
                IsActive = true
            };

            _context.CouponUsages.Add(usage);

            // Kupon kullanım sayacını artır
            coupon.CurrentUsageCount += 1;
            coupon.UDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return usage;
        }

        // Kupon Yönetimi (Admin)
        public async Task<Coupon> CreateCouponAsync(CouponDto dto)
        {
            // Kod benzersizliği kontrolü
            var exists = await _context.Coupons
                .AnyAsync(c => c.Code == dto.Code);

            if (exists)
                throw new Exception("COUPON_CODE_EXISTS|Bu kupon kodu zaten kullanılıyor.");

            var coupon = new Coupon
            {
                Code = dto.Code,
                Description = dto.Description,
                IsPercentage = dto.IsPercentage,
                DiscountAmount = dto.DiscountAmount,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                MaxUsageCount = dto.MaxUsageCount,
                CurrentUsageCount = 0,
                IsGlobal = dto.IsGlobal,
                SpecificTenantId = dto.SpecificTenantId,
                CDate = DateTime.Now,
                IsActive = true
            };

            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();

            return coupon;
        }

        public async Task<Coupon> UpdateCouponAsync(int couponId, CouponDto dto)
        {
            var coupon = await _context.Coupons.FindAsync(couponId);
            if (coupon == null)
                throw new Exception("COUPON_NOT_FOUND|Kupon bulunamadı.");

            // Kod değiştiriliyorsa benzersizlik kontrolü
            if (coupon.Code != dto.Code)
            {
                var exists = await _context.Coupons
                    .AnyAsync(c => c.Code == dto.Code && c.Id != couponId);

                if (exists)
                    throw new Exception("COUPON_CODE_EXISTS|Bu kupon kodu zaten kullanılıyor.");
            }

            coupon.Code = dto.Code;
            coupon.Description = dto.Description;
            coupon.IsPercentage = dto.IsPercentage;
            coupon.DiscountAmount = dto.DiscountAmount;
            coupon.StartDate = dto.StartDate;
            coupon.EndDate = dto.EndDate;
            coupon.MaxUsageCount = dto.MaxUsageCount;
            coupon.IsGlobal = dto.IsGlobal;
            coupon.SpecificTenantId = dto.SpecificTenantId;
            coupon.UDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return coupon;
        }

        public async Task<bool> DeleteCouponAsync(int couponId)
        {
            var coupon = await _context.Coupons.FindAsync(couponId);
            if (coupon == null) return false;

            // Soft delete
            coupon.IsActive = false;
            coupon.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Coupon>> GetAllCouponsAsync()
        {
            return await _context.Coupons
                .Where(c => c.IsActive == true)
                .OrderByDescending(c => c.CDate)
                .ToListAsync();
        }

        public async Task<Coupon?> GetCouponByIdAsync(int couponId)
        {
            return await _context.Coupons.FindAsync(couponId);
        }

        // İstatistikler
        public async Task<int> GetCouponUsageCountAsync(int couponId)
        {
            return await _context.CouponUsages
                .CountAsync(cu => cu.CouponId == couponId);
        }

        public async Task<bool> HasTenantUsedCouponAsync(int couponId, int tenantId)
        {
            return await _context.CouponUsages
                .AnyAsync(cu => cu.CouponId == couponId && cu.TenantId == tenantId);
        }
    }
}
