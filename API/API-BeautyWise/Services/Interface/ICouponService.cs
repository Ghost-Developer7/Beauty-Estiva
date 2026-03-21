using API_BeautyWise.DTO;
using API_BeautyWise.Models;

namespace API_BeautyWise.Services.Interface
{
    public interface ICouponService
    {
        // Kupon Doğrulama
        Task<CouponValidationResultDto> ValidateCouponAsync(string code, int tenantId, decimal originalPrice);
        
        // Kupon Kullanımı
        Task<CouponUsage> UseCouponAsync(string code, int tenantId, int subscriptionId, decimal originalPrice);
        
        // Kupon Yönetimi (Admin)
        Task<Coupon> CreateCouponAsync(CouponDto dto);
        Task<Coupon> UpdateCouponAsync(int couponId, CouponDto dto);
        Task<bool> DeleteCouponAsync(int couponId);
        Task<List<Coupon>> GetAllCouponsAsync();
        Task<Coupon?> GetCouponByIdAsync(int couponId);
        
        // Kupon İstatistikleri
        Task<int> GetCouponUsageCountAsync(int couponId);
        Task<bool> HasTenantUsedCouponAsync(int couponId, int tenantId);
    }
}
