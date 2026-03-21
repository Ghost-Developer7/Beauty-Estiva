using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API_BeautyWise.Controllers
{
    /// <summary>
    /// Randevu yönetimi (Owner + Staff)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Owner,Staff,Admin")]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        private int GetTenantId() =>
            int.TryParse(User.FindFirstValue("tenantId"), out var id) ? id : 0;

        private int GetUserId() =>
            int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        /// <summary>
        /// Randevu listesi (filtreli)
        /// GET /api/appointment
        /// GET /api/appointment?startDate=2025-01-01&endDate=2025-01-31
        /// GET /api/appointment?staffId=3
        /// GET /api/appointment?customerId=5
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] DateTime? startDate   = null,
            [FromQuery] DateTime? endDate     = null,
            [FromQuery] int?      staffId     = null,
            [FromQuery] int?      customerId  = null)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _appointmentService.GetAllAsync(tenantId, startDate, endDate, staffId, customerId);
                return Ok(ApiResponse<List<AppointmentListDto>>.Ok(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        /// <summary>
        /// Bugünkü randevular (kısayol)
        /// GET /api/appointment/today
        /// GET /api/appointment/today?staffId=3
        /// </summary>
        [HttpGet("today")]
        public async Task<IActionResult> GetToday([FromQuery] int? staffId = null)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var today  = DateTime.Today;
                var result = await _appointmentService.GetAllAsync(
                    tenantId, today, today.AddDays(1).AddSeconds(-1), staffId);
                return Ok(ApiResponse<List<AppointmentListDto>>.Ok(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        /// <summary>
        /// Randevu detayı (tekrarlayan ise tüm seri dahil)
        /// GET /api/appointment/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _appointmentService.GetByIdAsync(id, tenantId);
                if (result == null) return NotFound(ApiResponse<object>.Fail("Randevu bulunamadı."));

                return Ok(ApiResponse<AppointmentDetailDto>.Ok(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        /// <summary>
        /// Yeni randevu oluştur.
        /// Tekrarlayan seans için IsRecurring=true, RecurrenceIntervalDays ve TotalSessions gönder.
        /// Başarıyla oluşturulan tüm seans randevularını döner.
        /// POST /api/appointment
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AppointmentCreateDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                var userId   = GetUserId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result  = await _appointmentService.CreateAsync(tenantId, userId, dto);
                var message = dto.IsRecurring
                    ? $"{result.Count} seans randevusu oluşturuldu."
                    : "Randevu başarıyla oluşturuldu.";

                return Ok(ApiResponse<List<AppointmentListDto>>.Ok(result, message));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                return BadRequest(ApiResponse<object>.Fail(parts.Length > 1 ? parts[1] : ex.Message,
                                                            parts.Length > 1 ? parts[0] : null));
            }
        }

        /// <summary>
        /// Randevu güncelle (personel, hizmet, zaman değişikliği)
        /// PUT /api/appointment/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] AppointmentUpdateDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _appointmentService.UpdateAsync(id, tenantId, dto);
                return Ok(ApiResponse<AppointmentListDto>.Ok(result, "Randevu güncellendi."));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                return BadRequest(ApiResponse<object>.Fail(parts.Length > 1 ? parts[1] : ex.Message,
                                                            parts.Length > 1 ? parts[0] : null));
            }
        }

        /// <summary>
        /// Randevu durumu güncelle (Tamamlandı, İptal, Gelmedi vb.)
        /// PATCH /api/appointment/{id}/status
        /// </summary>
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] AppointmentStatusUpdateDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                await _appointmentService.UpdateStatusAsync(id, tenantId, dto);
                return Ok(ApiResponse<object>.Ok(true, $"Randevu durumu '{dto.Status}' olarak güncellendi."));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                return BadRequest(ApiResponse<object>.Fail(parts.Length > 1 ? parts[1] : ex.Message,
                                                            parts.Length > 1 ? parts[0] : null));
            }
        }

        /// <summary>
        /// Randevu iptal et
        /// DELETE /api/appointment/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Cancel(int id, [FromQuery] string? notes = null)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                await _appointmentService.CancelAsync(id, tenantId, notes);
                return Ok(ApiResponse<object>.Ok(true, "Randevu iptal edildi."));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                return BadRequest(ApiResponse<object>.Fail(parts.Length > 1 ? parts[1] : ex.Message,
                                                            parts.Length > 1 ? parts[0] : null));
            }
        }

        /// <summary>
        /// Personel müsaitlik kontrolü — belirli bir gün için uygun zaman dilimlerini listeler
        /// POST /api/appointment/check-availability
        /// </summary>
        [HttpPost("check-availability")]
        public async Task<IActionResult> CheckAvailability([FromBody] StaffAvailabilityRequestDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _appointmentService.GetStaffAvailabilityAsync(tenantId, dto);
                return Ok(ApiResponse<StaffAvailabilityResultDto>.Ok(result));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                return BadRequest(ApiResponse<object>.Fail(parts.Length > 1 ? parts[1] : ex.Message,
                                                            parts.Length > 1 ? parts[0] : null));
            }
        }
    }
}
