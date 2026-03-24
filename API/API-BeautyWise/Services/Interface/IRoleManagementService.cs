using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IRoleManagementService
    {
        Task<StaffListDto> ChangeUserRoleAsync(int tenantId, int performedByUserId, ChangeRoleRequestDto dto);
        Task<PaginatedResultDto<RoleChangeAuditLogDto>> GetAuditLogsAsync(AuditLogFilterDto filter);
    }
}
