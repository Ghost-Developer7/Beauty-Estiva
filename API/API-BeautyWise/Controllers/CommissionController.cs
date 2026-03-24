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

        /// <summary>Tüm personel/hizmet komisyon oranlarını getirir.</summary>
        [HttpGet("rates")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetAllRates()
        {
            try
            {
                var result = await _commissionService.GetAllCommissionRatesAsync(GetTenantId());
                return Ok(ApiResponse<AllCommissionRatesDto>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

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
        [HttpPut("rates")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> SetRates([FromBody] SetStaffCommissionDto dto, [FromQuery] int staffId)
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

        /// <summary>Personelin komisyon oranlarını ayarlar (eski route uyumluluğu).</summary>
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

        /// <summary>Komisyon kayıtlarını listeler (tarih, personel ve ödeme durumu filtreli).</summary>
        [HttpGet("records")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetRecords(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int? staffId,
            [FromQuery] bool? isPaid)
        {
            try
            {
                var records = await _commissionService.GetCommissionRecordsAsync(
                    GetTenantId(), startDate, endDate, staffId, isPaid);
                return Ok(ApiResponse<List<StaffCommissionRecordDto>>.Ok(records));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>Personel bazlı komisyon özetini getirir (ay/yıl filtreli).</summary>
        [HttpGet("summary")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetSummary(
            [FromQuery] int? month,
            [FromQuery] int? year,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                // Ay/yıl parametreleri verilmişse date aralığına çevir
                DateTime? sDate = startDate;
                DateTime? eDate = endDate;

                if (month.HasValue && year.HasValue)
                {
                    sDate = new DateTime(year.Value, month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
                    eDate = sDate.Value.AddMonths(1).AddDays(-1);
                }

                var summary = await _commissionService.GetCommissionSummaryAsync(
                    GetTenantId(), sDate, eDate);
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

        /// <summary>Bireysel personel komisyon geçmişi.</summary>
        [HttpGet("staff/{staffId}/summary")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetStaffSummary(
            int staffId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var summary = await _commissionService.GetStaffCommissionHistoryAsync(
                    GetTenantId(), staffId, startDate, endDate);
                return Ok(ApiResponse<StaffCommissionSummaryDto?>.Ok(summary));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>Tek komisyon kaydını "ödendi" olarak işaretler.</summary>
        [HttpPost("records/{id}/pay")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> PayRecord(int id)
        {
            try
            {
                await _commissionService.MarkCommissionsPaidAsync(
                    GetTenantId(), new List<int> { id }, GetUserId());
                return Ok(ApiResponse<object>.Ok(null!));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>Komisyon kayıtlarını "ödendi" olarak işaretler (çoklu).</summary>
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

        /// <summary>Aylık toplu ödeme — bir personelin belirli aydaki tüm ödenmemiş komisyonlarını öder.</summary>
        [HttpPost("records/bulk-pay")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> BulkPay(BulkPayCommissionsDto dto)
        {
            try
            {
                await _commissionService.BulkPayCommissionsAsync(
                    GetTenantId(), dto.StaffId, dto.Month, dto.Year, GetUserId());
                return Ok(ApiResponse<object>.Ok(null!));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
