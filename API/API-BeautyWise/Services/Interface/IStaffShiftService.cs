using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IStaffShiftService
    {
        Task<List<StaffShiftDto>> GetStaffShiftsAsync(int tenantId, int staffId);
        Task<List<StaffWeeklyShiftDto>> GetWeeklyViewAsync(int tenantId);
        Task BulkUpdateShiftsAsync(int tenantId, int staffId, StaffShiftBulkUpdateDto dto);
    }
}
