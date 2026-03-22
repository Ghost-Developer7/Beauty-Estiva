using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API_BeautyWise.Controllers
{
    /// <summary>
    /// Personel program yönetimi.
    /// Personel kendi kapalı aralıklarını yönetir.
    /// Owner/Admin tüm personellerin kapalı aralıklarını yönetebilir.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Owner,Staff,Admin")]
    public class StaffScheduleController : ControllerBase
    {
        private readonly IStaffScheduleService _scheduleService;

        public StaffScheduleController(IStaffScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        private int GetTenantId() =>
            int.TryParse(User.FindFirstValue("tenantId"), out var id) ? id : 0;

        private int GetUserId() =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        private bool IsOwnerOrAdmin() =>
            User.IsInRole("Owner") || User.IsInRole("Admin");

        /// <summary>
        /// Personelin kapalı aralıklarını listele.
        /// Staff kendi aralıklarını, Owner/Admin herkesinkini görebilir.
        /// GET /api/staffschedule/unavailability/{staffId}
        /// GET /api/staffschedule/unavailability/{staffId}?startDate=2025-01-01&endDate=2025-01-31
        /// </summary>
        [HttpGet("unavailability/{staffId:int}")]
        public async Task<IActionResult> GetUnavailabilities(
            int staffId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate   = null)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                // Staff kendi verilerini görür
                if (!IsOwnerOrAdmin() && GetUserId() != staffId)
                    return Forbid();

                var result = await _scheduleService.GetUnavailabilitiesAsync(tenantId, staffId, startDate, endDate);
                return Ok(ApiResponse<List<StaffUnavailabilityListDto>>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Kapalı aralık detayı
        /// GET /api/staffschedule/unavailability/detail/{id}
        /// </summary>
        [HttpGet("unavailability/detail/{id:int}")]
        public async Task<IActionResult> GetUnavailabilityById(int id)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _scheduleService.GetUnavailabilityByIdAsync(id, tenantId);
                if (result == null) return NotFound(ApiResponse<object>.Fail("Kayıt bulunamadı."));

                if (!IsOwnerOrAdmin() && GetUserId() != result.StaffId)
                    return Forbid();

                return Ok(ApiResponse<StaffUnavailabilityListDto>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Kapalı aralık ekle (izin, öğle molası vb.)
        /// Staff kendisi için, Owner/Admin herhangi bir personel için ekleyebilir.
        /// POST /api/staffschedule/unavailability
        /// POST /api/staffschedule/unavailability?staffId=5  (Owner/Admin başkası için)
        /// </summary>
        [HttpPost("unavailability")]
        public async Task<IActionResult> Create(
            [FromBody] StaffUnavailabilityCreateDto dto,
            [FromQuery] int? staffId = null)
        {
            try
            {
                var tenantId       = GetTenantId();
                var currentUserId  = GetUserId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                // StaffId belirleme: Owner/Admin başkası için ekleyebilir
                int targetStaffId;
                if (staffId.HasValue && IsOwnerOrAdmin())
                    targetStaffId = staffId.Value;
                else
                    targetStaffId = currentUserId; // Kendi için

                var id = await _scheduleService.CreateUnavailabilityAsync(tenantId, targetStaffId, dto);
                return Ok(ApiResponse<object>.Ok(new { Id = id }, "Kapalı aralık eklendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Kapalı aralık güncelle
        /// PUT /api/staffschedule/unavailability/{id}
        /// </summary>
        [HttpPut("unavailability/{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] StaffUnavailabilityUpdateDto dto)
        {
            try
            {
                var tenantId      = GetTenantId();
                var currentUserId = GetUserId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                // Sahiplik kontrolü
                var existing = await _scheduleService.GetUnavailabilityByIdAsync(id, tenantId);
                if (existing == null) return NotFound(ApiResponse<object>.Fail("Kayıt bulunamadı."));
                if (!IsOwnerOrAdmin() && existing.StaffId != currentUserId) return Forbid();

                await _scheduleService.UpdateUnavailabilityAsync(id, tenantId, existing.StaffId, dto);
                return Ok(ApiResponse<object>.Ok(true, "Kapalı aralık güncellendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Kapalı aralık sil
        /// DELETE /api/staffschedule/unavailability/{id}
        /// </summary>
        [HttpDelete("unavailability/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var tenantId      = GetTenantId();
                var currentUserId = GetUserId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var existing = await _scheduleService.GetUnavailabilityByIdAsync(id, tenantId);
                if (existing == null) return NotFound(ApiResponse<object>.Fail("Kayıt bulunamadı."));
                if (!IsOwnerOrAdmin() && existing.StaffId != currentUserId) return Forbid();

                await _scheduleService.DeleteUnavailabilityAsync(id, tenantId, existing.StaffId);
                return Ok(ApiResponse<object>.Ok(true, "Kapalı aralık silindi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Personelin günlük programını getir (randevu + kapalı aralıklar)
        /// GET /api/staffschedule/daily/{staffId}?date=2025-01-15
        /// </summary>
        [HttpGet("daily/{staffId:int}")]
        public async Task<IActionResult> GetDailySchedule(int staffId, [FromQuery] DateTime? date = null)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                if (!IsOwnerOrAdmin() && GetUserId() != staffId)
                    return Forbid();

                var targetDate = date ?? DateTime.Today;
                var result     = await _scheduleService.GetDailyScheduleAsync(tenantId, staffId, targetDate);
                return Ok(ApiResponse<StaffDailyScheduleDto>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
