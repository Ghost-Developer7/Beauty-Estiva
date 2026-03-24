using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface ICustomerService
    {
        Task<List<CustomerListDto>> GetAllAsync(int tenantId, string? search = null);
        Task<PaginatedResponse<CustomerListDto>> GetAllPaginatedAsync(int tenantId, int pageNumber, int pageSize, string? search = null);
        Task<CustomerDetailDto?> GetByIdAsync(int id, int tenantId);
        Task<int> CreateAsync(int tenantId, CustomerCreateDto dto);
        Task<bool> UpdateAsync(int id, int tenantId, CustomerUpdateDto dto);
        Task<bool> DeleteAsync(int id, int tenantId);

        // ── Loyalty & History ──
        Task<CustomerHistoryDto> GetHistoryAsync(int id, int tenantId);
        Task<CustomerStatsDto> GetStatsAsync(int id, int tenantId);
        Task<bool> UpdateLoyaltyPointsAsync(int id, int tenantId, UpdateLoyaltyPointsDto dto);
        Task<bool> UpdateTagsAsync(int id, int tenantId, UpdateCustomerTagsDto dto);
        Task<List<CustomerListDto>> GetVipCustomersAsync(int tenantId);
    }
}
