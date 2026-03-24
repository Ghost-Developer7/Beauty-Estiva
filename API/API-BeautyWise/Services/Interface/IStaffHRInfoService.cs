using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IStaffHRInfoService
    {
        Task<StaffHRInfoDto?> GetHRInfoAsync(int tenantId, int staffId);
        Task UpsertHRInfoAsync(int tenantId, int staffId, StaffHRInfoUpdateDto dto);
        Task<List<StaffHRSummaryDto>> GetHRSummaryAsync(int tenantId);
    }
}
