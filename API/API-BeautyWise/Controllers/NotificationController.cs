using API_BeautyWise.DTO;
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
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private int GetTenantId() => int.Parse(User.FindFirstValue("tenantId")!);
        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // ─── Tenant Settings ───

        [HttpGet("settings")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var settings = await _notificationService.GetTenantSettingsAsync(GetTenantId());
                return Ok(ApiResponse<TenantSettingsDto>.Ok(settings));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpPut("settings")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> UpdateSettings([FromBody] TenantSettingsUpdateDto dto)
        {
            try
            {
                await _notificationService.UpdateTenantSettingsAsync(GetTenantId(), GetUserId(), dto);
                return Ok(ApiResponse<object>.Ok(null, "Ayarlar güncellendi."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
        }

        // ─── Notification Rules ───

        [HttpGet("rules")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetRules()
        {
            try
            {
                var rules = await _notificationService.GetNotificationRulesAsync(GetTenantId());
                return Ok(ApiResponse<List<NotificationRuleDto>>.Ok(rules));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpPut("rules")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> UpdateRule([FromBody] NotificationRuleUpdateDto dto)
        {
            try
            {
                await _notificationService.UpdateNotificationRuleAsync(GetTenantId(), GetUserId(), dto);
                return Ok(ApiResponse<object>.Ok(null, "Bildirim kanalı güncellendi."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
        }

        // ─── WhatsApp Integration ───

        [HttpGet("whatsapp")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetWhatsapp()
        {
            try
            {
                var integration = await _notificationService.GetWhatsappIntegrationAsync(GetTenantId());
                return Ok(ApiResponse<WhatsappIntegrationDto?>.Ok(integration));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpPut("whatsapp")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> SaveWhatsapp([FromBody] WhatsappIntegrationDto dto)
        {
            try
            {
                await _notificationService.SaveWhatsappIntegrationAsync(GetTenantId(), dto);
                return Ok(ApiResponse<object>.Ok(null, "WhatsApp entegrasyonu kaydedildi."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
        }

        // ─── Send Reminder ───

        [HttpPost("send-reminder")]
        [Authorize(Roles = "Owner,Admin,Staff")]
        public async Task<IActionResult> SendReminder([FromBody] SendReminderDto dto)
        {
            try
            {
                var result = await _notificationService.SendWhatsappReminderAsync(GetTenantId(), dto.AppointmentId);
                if (result.Sent)
                    return Ok(ApiResponse<SendReminderResultDto>.Ok(result));
                else
                    return BadRequest(ApiResponse<SendReminderResultDto>.Fail(result.Message ?? "Gönderilemedi."));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message));
            }
        }
    }
}
