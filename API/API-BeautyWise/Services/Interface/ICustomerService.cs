using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface ICustomerService
    {
        Task<List<CustomerListDto>> GetAllAsync(int tenantId, string? search = null);
        Task<CustomerDetailDto?> GetByIdAsync(int id, int tenantId);
        Task<int> CreateAsync(int tenantId, CustomerCreateDto dto);
        Task<bool> UpdateAsync(int id, int tenantId, CustomerUpdateDto dto);
        Task<bool> DeleteAsync(int id, int tenantId);
    }
}
