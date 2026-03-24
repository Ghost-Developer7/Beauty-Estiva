using API_BeautyWise.DTO;
using API_BeautyWise.Filters;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API_BeautyWise.Controllers
{
    /// <summary>
    /// Personel izin yonetimi.
    /// Izin talebi olusturma, onaylama, reddetme ve listeleme.
    /// </summary>
    [ApiController]
    [Route("api/staff/leaves")]
    [Authorize(Roles = "Owner,Staff,Admin")]
    [SubscriptionRequired]
    public class StaffLeaveController : ControllerBase
    {
        private readonly IStaffLeaveService _leaveService;

        public StaffLeaveController(IStaffLeaveService leaveService)
        {
            _leaveService = leaveService;
        }

        private int GetTenantId() =>
            int.TryParse(User.FindFirstValue("tenantId"), out var id) ? id : 0;

        private int GetUserId() =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        private bool IsOwnerOrAdmin() =>
            User.IsInRole("Owner") || User.IsInRole("Admin");

        /// <summary>
        /// Izinleri listele.
        /// GET /api/staff/leaves?staffId=&status=&month=&year=
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetLeaves(
            [FromQuery] int? staffId = null,
            [FromQuery] string? status = null,
            [FromQuery] int? month = null,
            [FromQuery] int? year = null)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                // Staff sadece kendi izinlerini gorebilir
                if (!IsOwnerOrAdmin())
                    staffId = GetUserId();

                var result = await _leaveService.GetLeavesAsync(tenantId, staffId, status, month, year);
                return Ok(ApiResponse<List<StaffLeaveListDto>>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("Islem sirasinda bir hata olustu."));
            }
        }

        /// <summary>
        /// Izin talebi olustur.
        /// POST /api/staff/leaves
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateLeave([FromBody] StaffLeaveCreateDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                var id = await _leaveService.CreateLeaveAsync(tenantId, GetUserId(), dto, IsOwnerOrAdmin());
                return Ok(ApiResponse<object>.Ok(new { Id = id }, "Izin talebi olusturuldu."));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                var msg = parts.Length > 1 ? parts[1] : "Islem sirasinda bir hata olustu.";
                return BadRequest(ApiResponse<object>.Fail(msg, parts[0]));
            }
        }

        /// <summary>
        /// Izin talebini onayla (Owner/Admin).
        /// PUT /api/staff/leaves/{id}/approve
        /// </summary>
        [HttpPut("{id:int}/approve")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> ApproveLeave(int id)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                await _leaveService.ApproveLeaveAsync(tenantId, id, GetUserId());
                return Ok(ApiResponse<object>.Ok(true, "Izin talebi onaylandi."));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                var msg = parts.Length > 1 ? parts[1] : "Islem sirasinda bir hata olustu.";
                return BadRequest(ApiResponse<object>.Fail(msg, parts[0]));
            }
        }

        /// <summary>
        /// Izin talebini reddet (Owner/Admin).
        /// PUT /api/staff/leaves/{id}/reject
        /// </summary>
        [HttpPut("{id:int}/reject")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> RejectLeave(int id)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                await _leaveService.RejectLeaveAsync(tenantId, id, GetUserId());
                return Ok(ApiResponse<object>.Ok(true, "Izin talebi reddedildi."));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                var msg = parts.Length > 1 ? parts[1] : "Islem sirasinda bir hata olustu.";
                return BadRequest(ApiResponse<object>.Fail(msg, parts[0]));
            }
        }

        /// <summary>
        /// Izin talebini iptal et.
        /// DELETE /api/staff/leaves/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteLeave(int id)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                await _leaveService.DeleteLeaveAsync(tenantId, id, GetUserId(), IsOwnerOrAdmin());
                return Ok(ApiResponse<object>.Ok(true, "Izin talebi silindi."));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                var msg = parts.Length > 1 ? parts[1] : "Islem sirasinda bir hata olustu.";
                if (parts[0] == "FORBIDDEN")
                    return StatusCode(403, ApiResponse<object>.Fail(msg, parts[0]));
                return BadRequest(ApiResponse<object>.Fail(msg, parts[0]));
            }
        }

        /// <summary>
        /// Izin bakiyelerini getir.
        /// GET /api/staff/leaves/balances
        /// </summary>
        [HttpGet("balances")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetLeaveBalances()
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                var result = await _leaveService.GetLeaveBalancesAsync(tenantId);
                return Ok(ApiResponse<List<StaffLeaveBalanceDto>>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("Islem sirasinda bir hata olustu."));
            }
        }
    }
}
