using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IPackageSaleService
    {
        // Package Sales
        Task<List<PackageSaleListDto>> GetAllAsync(int tenantId, DateTime? startDate = null, DateTime? endDate = null,
            int? customerId = null, int? treatmentId = null, int? status = null);
        Task<PackageSaleListDto?> GetByIdAsync(int id, int tenantId);
        Task<int> CreateAsync(int tenantId, int staffId, PackageSaleCreateDto dto);
        Task UpdateAsync(int id, int tenantId, PackageSaleUpdateDto dto);
        Task DeleteAsync(int id, int tenantId);

        // Stats
        Task<PackageSaleStatsDto> GetStatsAsync(int tenantId, DateTime? startDate = null, DateTime? endDate = null);

        // Usage
        Task<int> RecordUsageAsync(int packageSaleId, int tenantId, PackageSaleUsageCreateDto dto);
        Task DeleteUsageAsync(int usageId, int tenantId);

        // Payments
        Task<int> AddPaymentAsync(int packageSaleId, int tenantId, PackageSalePaymentCreateDto dto);
    }
}
