using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IStaffService
    {
        Task<List<StaffListDto>> GetStaffListAsync(int tenantId);
        Task<PaginatedResponse<StaffListDto>> GetStaffListPaginatedAsync(int tenantId, int pageNumber, int pageSize);
        Task<StaffListDto?> GetStaffByIdAsync(int tenantId, int staffId);
    }
}
