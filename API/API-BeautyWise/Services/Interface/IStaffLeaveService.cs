using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IStaffLeaveService
    {
        Task<List<StaffLeaveListDto>> GetLeavesAsync(int tenantId, int? staffId = null, string? status = null, int? month = null, int? year = null);
        Task<int> CreateLeaveAsync(int tenantId, int requesterId, StaffLeaveCreateDto dto, bool isOwnerOrAdmin);
        Task ApproveLeaveAsync(int tenantId, int leaveId, int approvedById);
        Task RejectLeaveAsync(int tenantId, int leaveId, int rejectedById);
        Task DeleteLeaveAsync(int tenantId, int leaveId, int requesterId, bool isOwnerOrAdmin);
        Task<List<StaffLeaveBalanceDto>> GetLeaveBalancesAsync(int tenantId);
    }
}
