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
    /// Personel vardiya/mesai yonetimi.
    /// Haftalik calisma programi tanimlama ve goruntuleme.
    /// </summary>
    [ApiController]
    [Route("api/staff")]
    [Authorize(Roles = "Owner,Staff,Admin")]
    [SubscriptionRequired]
    public class StaffShiftController : ControllerBase
    {
        private readonly IStaffShiftService _shiftService;

        public StaffShiftController(IStaffShiftService shiftService)
        {
            _shiftService = shiftService;
        }

        private int GetTenantId() =>
            int.TryParse(User.FindFirstValue("tenantId"), out var id) ? id : 0;

        private int GetUserId() =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        private bool IsOwnerOrAdmin() =>
            User.IsInRole("Owner") || User.IsInRole("Admin");

        /// <summary>
        /// Belirli bir personelin haftalik vardiya programini getir.
        /// GET /api/staff/{staffId}/shifts
        /// </summary>
        [HttpGet("{staffId:int}/shifts")]
        public async Task<IActionResult> GetStaffShifts(int staffId)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                if (!IsOwnerOrAdmin() && GetUserId() != staffId)
                    return Forbid();

                var result = await _shiftService.GetStaffShiftsAsync(tenantId, staffId);
                return Ok(ApiResponse<List<StaffShiftDto>>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("Islem sirasinda bir hata olustu."));
            }
        }

        /// <summary>
        /// Bir personelin haftalik vardiyasini toplu guncelle (7 gun).
        /// PUT /api/staff/{staffId}/shifts
        /// </summary>
        [HttpPut("{staffId:int}/shifts")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> UpdateStaffShifts(int staffId, [FromBody] StaffShiftBulkUpdateDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                await _shiftService.BulkUpdateShiftsAsync(tenantId, staffId, dto);
                return Ok(ApiResponse<object>.Ok(true, "Vardiya programi guncellendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("Islem sirasinda bir hata olustu."));
            }
        }

        /// <summary>
        /// Tum personellerin haftalik vardiya gorunumu.
        /// GET /api/staff/shifts/weekly-view
        /// </summary>
        [HttpGet("shifts/weekly-view")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetWeeklyView()
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                var result = await _shiftService.GetWeeklyViewAsync(tenantId);
                return Ok(ApiResponse<List<StaffWeeklyShiftDto>>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("Islem sirasinda bir hata olustu."));
            }
        }
    }
}
