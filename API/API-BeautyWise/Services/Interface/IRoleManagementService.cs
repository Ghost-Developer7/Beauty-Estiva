using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IRoleManagementService
    {
        Task<StaffListDto> ChangeUserRoleAsync(int tenantId, int performedByUserId, ChangeRoleRequestDto dto);
        Task<StaffListDto> ToggleRoleAsync(int tenantId, int performedByUserId, int targetUserId, ToggleRoleRequestDto dto);
        Task<PaginatedResultDto<RoleChangeAuditLogDto>> GetAuditLogsAsync(AuditLogFilterDto filter);
    }
}
