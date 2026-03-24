using API_BeautyWise.DTO;
using API_BeautyWise.Models;

namespace API_BeautyWise.Services.Interface
{
    public interface ISubscriptionService
    {
        // Paket Yönetimi
        Task<List<SubscriptionPlan>> GetAvailablePlansAsync();
        Task<SubscriptionPlan?> GetPlanByIdAsync(int planId);

        // Abonelik Bilgisi
        Task<CurrentSubscriptionDto?> GetCurrentSubscriptionAsync(int tenantId);
        Task<bool> IsSubscriptionActiveAsync(int tenantId);
        Task<bool> IsInTrialPeriodAsync(int tenantId);

        // Abonelik Satın Alma (userIp: PayTR için zorunlu)
        Task<SubscriptionPurchaseResultDto> PurchaseSubscriptionAsync(int tenantId, SubscriptionPurchaseDto dto, string userIp);
        Task<bool> ActivateSubscriptionAsync(int subscriptionId, string payTrReferenceNo);

        // Deneme Süresi
        Task<TenantSubscription> CreateTrialSubscriptionAsync(int tenantId, int planId);

        // Abonelik İptal ve İade
        Task<bool> CancelSubscriptionAsync(int tenantId, CancelSubscriptionDto dto);
        Task<bool> ProcessRefundAsync(int subscriptionId, decimal refundAmount, string reason);

        // Ödeme Geçmişi
        Task<List<PaymentHistoryDto>> GetPaymentHistoryAsync(int tenantId);

        // Otomatik Yenileme
        Task<bool> RenewSubscriptionAsync(int tenantId);
        Task<List<TenantSubscription>> GetSubscriptionsDueForRenewalAsync();

        // Grace Period
        Task<bool> StartGracePeriodAsync(int subscriptionId);
        Task<bool> EndGracePeriodAsync(int subscriptionId, bool success);

        // Paket Limit Kontrolleri
        /// <summary>
        /// Tenant için geçerli planı döner. Deneme süresindeyse Gold limitleri uygulanır.
        /// </summary>
        Task<SubscriptionPlan?> GetEffectivePlanAsync(int tenantId);

        /// <summary>
        /// Tenant'ın personel ekleme limitine ulaşıp ulaşmadığını kontrol eder.
        /// </summary>
        Task<(bool canAdd, int currentCount, int maxCount, string? errorMessage)> CanAddStaffAsync(int tenantId);

        // Admin: Tüm planları listele (aktif/pasif dahil)
        Task<List<SubscriptionPlan>> GetAllPlansAsync();

        // Admin: Plan güncelle
        Task<SubscriptionPlan?> UpdatePlanAsync(int planId, SubscriptionPlan updatedPlan);

        // Admin: Plan aktif/pasif toggle
        Task<bool> TogglePlanStatusAsync(int planId);
    }
}
