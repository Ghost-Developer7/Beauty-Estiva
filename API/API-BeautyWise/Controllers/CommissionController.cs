using API_BeautyWise.Filters;
using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API_BeautyWise.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [SubscriptionRequired]
    public class CommissionController : ControllerBase
    {
        private readonly IStaffCommissionService _commissionService;

        public CommissionController(IStaffCommissionService commissionService)
        {
            _commissionService = commissionService;
        }

        private int GetTenantId() =>
            int.Parse(User.FindFirstValue("tenantId") ?? "0");

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

        /// <summary>Personelin komisyon oranlarını getirir.</summary>
        [HttpGet("staff/{staffId}/rates")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetStaffRates(int staffId)
        {
            try
            {
                var result = await _commissionService.GetStaffCommissionRatesAsync(GetTenantId(), staffId);
                return Ok(ApiResponse<StaffCommissionRateDto>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>Personelin komisyon oranlarını ayarlar.</summary>
        [HttpPut("staff/{staffId}/rates")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> SetStaffRates(int staffId, SetStaffCommissionDto dto)
        {
            try
            {
                await _commissionService.SetStaffCommissionAsync(GetTenantId(), staffId, dto, GetUserId());
                return Ok(ApiResponse<object>.Ok(null!));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>Komisyon kayıtlarını listeler (tarih ve personel filtreli).</summary>
        [HttpGet("records")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetRecords(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? staffId)
        {
            try
            {
                var records = await _commissionService.GetCommissionRecordsAsync(
                    GetTenantId(), startDate, endDate, staffId);
                return Ok(ApiResponse<List<StaffCommissionRecordDto>>.Ok(records));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>Personel bazlı komisyon özetini getirir.</summary>
        [HttpGet("summary")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetSummary(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var summary = await _commissionService.GetCommissionSummaryAsync(
                    GetTenantId(), startDate, endDate);
                return Ok(ApiResponse<List<StaffCommissionSummaryDto>>.Ok(summary));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>Personelin kendi komisyon özetini görür.</summary>
        [HttpGet("my")]
        public async Task<IActionResult> GetMyCommission(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var summary = await _commissionService.GetMyCommissionSummaryAsync(
                    GetTenantId(), GetUserId(), startDate, endDate);
                return Ok(ApiResponse<StaffCommissionSummaryDto?>.Ok(summary));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>Komisyon kayıtlarını "ödendi" olarak işaretler.</summary>
        [HttpPost("mark-paid")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> MarkPaid(MarkCommissionsPaidDto dto)
        {
            try
            {
                await _commissionService.MarkCommissionsPaidAsync(
                    GetTenantId(), dto.CommissionRecordIds, GetUserId());
                return Ok(ApiResponse<object>.Ok(null!));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
