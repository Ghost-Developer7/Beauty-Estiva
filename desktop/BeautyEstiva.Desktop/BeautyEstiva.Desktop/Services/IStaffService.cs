using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public interface IStaffService
{
    Task<ApiResponse<List<StaffMember>>> ListAsync();
    Task<ApiResponse<PaginatedResponse<StaffMember>>> ListPaginatedAsync(int page = 1, int pageSize = 20);
    Task<ApiResponse<StaffMember>> GetByIdAsync(int id);
}
