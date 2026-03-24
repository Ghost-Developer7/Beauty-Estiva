using API_BeautyWise.DTO;
using API_BeautyWise.Filters;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API_BeautyWise.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [SubscriptionRequired]
    public class TenantSettingsController : ControllerBase
    {
        private readonly ITenantSettingsService _settingsService;

        public TenantSettingsController(ITenantSettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        private int GetTenantId() => int.Parse(User.FindFirstValue("tenantId")!);
        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        /// <summary>
        /// Tüm tenant ayarlarını döndürür.
        /// GET /api/tenantsettings
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var settings = await _settingsService.GetFullSettingsAsync(GetTenantId());
                if (settings == null)
                    return NotFound(ApiResponse<object>.Fail("Tenant bulunamadı."));

                return Ok(ApiResponse<TenantFullSettingsDto>.Ok(settings));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Salon profil bilgilerini günceller.
        /// PUT /api/tenantsettings/profile
        /// </summary>
        [HttpPut("profile")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateTenantProfileDto dto)
        {
            try
            {
                await _settingsService.UpdateProfileAsync(GetTenantId(), GetUserId(), dto);
                return Ok(ApiResponse<object>.Ok(null, "Profil güncellendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Çalışma saatlerini günceller.
        /// PUT /api/tenantsettings/working-hours
        /// </summary>
        [HttpPut("working-hours")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> UpdateWorkingHours([FromBody] UpdateWorkingHoursDto dto)
        {
            try
            {
                await _settingsService.UpdateWorkingHoursAsync(GetTenantId(), GetUserId(), dto);
                return Ok(ApiResponse<object>.Ok(null, "Çalışma saatleri güncellendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Tatil günlerini günceller.
        /// PUT /api/tenantsettings/holidays
        /// </summary>
        [HttpPut("holidays")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> UpdateHolidays([FromBody] UpdateHolidaysDto dto)
        {
            try
            {
                await _settingsService.UpdateHolidaysAsync(GetTenantId(), GetUserId(), dto);
                return Ok(ApiResponse<object>.Ok(null, "Tatil günleri güncellendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Randevu ayarlarını günceller.
        /// PUT /api/tenantsettings/appointment-settings
        /// </summary>
        [HttpPut("appointment-settings")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> UpdateAppointmentSettings([FromBody] UpdateAppointmentSettingsDto dto)
        {
            try
            {
                await _settingsService.UpdateAppointmentSettingsAsync(GetTenantId(), GetUserId(), dto);
                return Ok(ApiResponse<object>.Ok(null, "Randevu ayarları güncellendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Bildirim ayarlarını günceller.
        /// PUT /api/tenantsettings/notification-settings
        /// </summary>
        [HttpPut("notification-settings")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> UpdateNotificationSettings([FromBody] UpdateNotificationSettingsDto dto)
        {
            try
            {
                await _settingsService.UpdateNotificationSettingsAsync(GetTenantId(), GetUserId(), dto);
                return Ok(ApiResponse<object>.Ok(null, "Bildirim ayarları güncellendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
