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
    /// Personel ozluk bilgileri yonetimi.
    /// Ise giris tarihi, pozisyon, maas, acil durum iletisim vb.
    /// </summary>
    [ApiController]
    [Route("api/staff")]
    [Authorize(Roles = "Owner,Staff,Admin")]
    [SubscriptionRequired]
    public class StaffHRController : ControllerBase
    {
        private readonly IStaffHRInfoService _hrService;

        public StaffHRController(IStaffHRInfoService hrService)
        {
            _hrService = hrService;
        }

        private int GetTenantId() =>
            int.TryParse(User.FindFirstValue("tenantId"), out var id) ? id : 0;

        private int GetUserId() =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        private bool IsOwnerOrAdmin() =>
            User.IsInRole("Owner") || User.IsInRole("Admin");

        /// <summary>
        /// Personel ozluk bilgisini getir.
        /// GET /api/staff/{staffId}/hr-info
        /// </summary>
        [HttpGet("{staffId:int}/hr-info")]
        public async Task<IActionResult> GetHRInfo(int staffId)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                // Staff sadece kendi bilgilerini gorebilir
                if (!IsOwnerOrAdmin() && GetUserId() != staffId)
                    return Forbid();

                var result = await _hrService.GetHRInfoAsync(tenantId, staffId);
                if (result == null)
                    return NotFound(ApiResponse<object>.Fail("Personel bulunamadi.", "NOT_FOUND"));

                return Ok(ApiResponse<StaffHRInfoDto>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("Islem sirasinda bir hata olustu."));
            }
        }

        /// <summary>
        /// Personel ozluk bilgisini guncelle (Owner/Admin).
        /// PUT /api/staff/{staffId}/hr-info
        /// </summary>
        [HttpPut("{staffId:int}/hr-info")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> UpdateHRInfo(int staffId, [FromBody] StaffHRInfoUpdateDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                await _hrService.UpsertHRInfoAsync(tenantId, staffId, dto);
                return Ok(ApiResponse<object>.Ok(true, "Ozluk bilgileri guncellendi."));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                var msg = parts.Length > 1 ? parts[1] : "Islem sirasinda bir hata olustu.";
                return BadRequest(ApiResponse<object>.Fail(msg, parts[0]));
            }
        }

        /// <summary>
        /// Tum personellerin ozluk bilgisi ozeti.
        /// GET /api/staff/hr-summary
        /// </summary>
        [HttpGet("hr-summary")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetHRSummary()
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                var result = await _hrService.GetHRSummaryAsync(tenantId);
                return Ok(ApiResponse<List<StaffHRSummaryDto>>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("Islem sirasinda bir hata olustu."));
            }
        }
    }
}
