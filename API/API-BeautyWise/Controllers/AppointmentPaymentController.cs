using API_BeautyWise.Filters;
using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API_BeautyWise.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [SubscriptionRequired]
    public class AppointmentPaymentController : ControllerBase
    {
        private readonly IAppointmentPaymentService _service;
        private readonly UserManager<AppUser>       _userManager;

        public AppointmentPaymentController(IAppointmentPaymentService service, UserManager<AppUser> userManager)
        {
            _service     = service;
            _userManager = userManager;
        }

        // ─── Helpers ──────────────────────────────────────────────────────────────

        private async Task<(AppUser user, bool isOwnerOrAdmin)> GetCurrentUserAsync()
        {
            var user  = await _userManager.GetUserAsync(User) ?? throw new Exception("Kullanıcı bulunamadı.");
            var roles = await _userManager.GetRolesAsync(user);
            return (user, roles.Any(r => r == "Owner" || r == "Admin"));
        }

        // ─── GET /api/appointmentpayment?startDate=&endDate=&staffId=&customerId= ──

        /// <summary>
        /// Ödeme listesi.
        /// Owner/Admin → tüm ödemeler (staffId ile filtreyebilir).
        /// Staff       → sadece kendi randevularına ait ödemeler.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] DateTime? startDate  = null,
            [FromQuery] DateTime? endDate    = null,
            [FromQuery] int?      staffId    = null,
            [FromQuery] int?      customerId = null)
        {
            var (user, isOwnerOrAdmin) = await GetCurrentUserAsync();

            // Staff kendi dışındaki verileri göremez
            var effectiveStaffId = isOwnerOrAdmin ? staffId : user.Id;

            var list = await _service.GetAllAsync(
                user.TenantId, startDate, endDate, effectiveStaffId, customerId);

            return Ok(ApiResponse<object>.Ok(list, $"{list.Count} ödeme kaydı bulundu."));
        }

        // ─── GET /api/appointmentpayment/appointment/{appointmentId} ─────────────

        /// <summary>Belirli randevuya ait ödemeler</summary>
        [HttpGet("appointment/{appointmentId}")]
        public async Task<IActionResult> GetByAppointment(int appointmentId)
        {
            var (user, _) = await GetCurrentUserAsync();
            var list = await _service.GetByAppointmentAsync(appointmentId, user.TenantId);
            return Ok(ApiResponse<object>.Ok(list, $"{list.Count} ödeme kaydı bulundu."));
        }

        // ─── GET /api/appointmentpayment/{id} ────────────────────────────────────

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var (user, _) = await GetCurrentUserAsync();
            var item = await _service.GetByIdAsync(id, user.TenantId);

            return item == null
                ? NotFound(ApiResponse<object>.Fail("Ödeme kaydı bulunamadı.", "NOT_FOUND"))
                : Ok(ApiResponse<object>.Ok(item, "Ödeme kaydı getirildi."));
        }

        // ─── POST /api/appointmentpayment ─────────────────────────────────────────

        /// <summary>Randevuya ödeme kaydı ekle (Owner, Admin, Staff)</summary>
        [HttpPost]
        [Authorize(Roles = "Owner,Admin,Staff")]
        public async Task<IActionResult> Create([FromBody] AppointmentPaymentCreateDto dto)
        {
            var (user, _) = await GetCurrentUserAsync();
            var id = await _service.CreateAsync(user.TenantId, user.Id, dto);
            return Ok(ApiResponse<object>.Ok(new { id }, "Ödeme kaydedildi."));
        }

        // ─── PUT /api/appointmentpayment/{id} ────────────────────────────────────

        /// <summary>Ödeme güncelle (Owner, Admin)</summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] AppointmentPaymentUpdateDto dto)
        {
            var (user, _) = await GetCurrentUserAsync();
            await _service.UpdateAsync(id, user.TenantId, dto);
            return Ok(ApiResponse<object>.Ok((object?)null, "Ödeme güncellendi."));
        }

        // ─── DELETE /api/appointmentpayment/{id} ─────────────────────────────────

        /// <summary>Ödeme sil (soft delete — Owner, Admin)</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var (user, _) = await GetCurrentUserAsync();
            await _service.DeleteAsync(id, user.TenantId);
            return Ok(ApiResponse<object>.Ok((object?)null, "Ödeme kaydı silindi."));
        }
    }
}
