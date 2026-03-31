using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public interface ICustomerService
{
    Task<ApiResponse<List<CustomerListItem>>> ListAsync(string? search = null);
    Task<ApiResponse<PaginatedResponse<CustomerListItem>>> ListPaginatedAsync(int page = 1, int pageSize = 20, string? search = null);
    Task<ApiResponse<CustomerDetail>> GetByIdAsync(int id);
    Task<ApiResponse<object>> CreateAsync(CustomerCreate data);
    Task<ApiResponse<object>> UpdateAsync(int id, CustomerCreate data);
    Task<ApiResponse<object>> DeleteAsync(int id);
}
