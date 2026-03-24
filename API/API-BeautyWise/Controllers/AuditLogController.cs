using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API_BeautyWise.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin")]
    public class AuditLogController : ControllerBase
    {
        private readonly IRoleManagementService _roleManagementService;

        public AuditLogController(IRoleManagementService roleManagementService)
        {
            _roleManagementService = roleManagementService;
        }

        /// <summary>
        /// Rol değişiklik loglarını filtreli olarak getirir (sadece SuperAdmin)
        /// GET api/auditlog/role-changes?startDate=2026-01-01&endDate=2026-12-31&tenantId=1&targetUserId=5&performedByUserId=1&actionType=RoleAdded&roleName=Admin&page=1&pageSize=50
        /// </summary>
        [HttpGet("role-changes")]
        public async Task<IActionResult> GetRoleChangeAuditLogs([FromQuery] AuditLogFilterDto filter)
        {
            try
            {
                var result = await _roleManagementService.GetAuditLogsAsync(filter);
                return Ok(ApiResponse<PaginatedResultDto<RoleChangeAuditLogDto>>.Ok(result));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Audit log sorgulanırken bir hata oluştu."));
            }
        }
    }
}
