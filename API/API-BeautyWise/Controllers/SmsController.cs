using API_BeautyWise.Filters;
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
    [SubscriptionRequired]
    public class SmsController : ControllerBase
    {
        private readonly ISmsService _smsService;

        public SmsController(ISmsService smsService)
        {
            _smsService = smsService;
        }

        private int GetTenantId() => int.Parse(User.FindFirstValue("tenantId")!);

        // ─── Send Single SMS ───

        [HttpPost("send")]
        [Authorize(Roles = "Owner,Admin,Staff")]
        public async Task<IActionResult> SendSms([FromBody] SendSmsDto dto)
        {
            try
            {
                var result = await _smsService.SendSmsAsync(GetTenantId(), dto.PhoneNumber, dto.Message);
                if (result.Success)
                    return Ok(ApiResponse<SmsResult>.Ok(result));
                else
                    return BadRequest(ApiResponse<SmsResult>.Fail(result.Message ?? "SMS gönderilemedi."));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        // ─── Send Bulk SMS ───

        [HttpPost("send-bulk")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> SendBulkSms([FromBody] SendBulkSmsDto dto)
        {
            try
            {
                var result = await _smsService.SendBulkSmsAsync(GetTenantId(), dto.PhoneNumbers, dto.Message);
                if (result.Success)
                    return Ok(ApiResponse<SmsResult>.Ok(result));
                else
                    return BadRequest(ApiResponse<SmsResult>.Fail(result.Message ?? "SMS gönderilemedi."));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        // ─── Credit Balance ───

        [HttpGet("balance")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetBalance()
        {
            try
            {
                var result = await _smsService.GetCreditBalanceAsync(GetTenantId());
                return Ok(ApiResponse<SmsCreditResult>.Ok(result));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        // ─── Get SMS Settings ───

        [HttpGet("settings")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var settings = await _smsService.GetSmsSettingsAsync(GetTenantId());
                return Ok(ApiResponse<SmsSettingsDto>.Ok(settings));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        // ─── Save SMS Settings ───

        [HttpPut("settings")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> SaveSettings([FromBody] SmsSettingsDto dto)
        {
            try
            {
                await _smsService.SaveSmsSettingsAsync(GetTenantId(), dto);
                return Ok(ApiResponse<object>.Ok(null, "SMS ayarları kaydedildi."));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        // ─── Test SMS ───

        [HttpPost("test")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> SendTestSms([FromBody] TestSmsDto dto)
        {
            try
            {
                var message = "Bu bir test SMS'idir. SMS entegrasyonunuz başarıyla çalışmaktadır.";
                var result = await _smsService.SendSmsAsync(GetTenantId(), dto.PhoneNumber, message);
                if (result.Success)
                    return Ok(ApiResponse<SmsResult>.Ok(result, "Test SMS'i başarıyla gönderildi."));
                else
                    return BadRequest(ApiResponse<SmsResult>.Fail(result.Message ?? "Test SMS'i gönderilemedi."));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        // ─── Appointment Reminder ───

        [HttpPost("appointment-reminder/{appointmentId}")]
        [Authorize(Roles = "Owner,Admin,Staff")]
        public async Task<IActionResult> SendAppointmentReminder(int appointmentId)
        {
            try
            {
                var result = await _smsService.SendAppointmentReminderAsync(GetTenantId(), appointmentId);
                if (result.Success)
                    return Ok(ApiResponse<SmsResult>.Ok(result, "Hatırlatma SMS'i gönderildi."));
                else
                    return BadRequest(ApiResponse<SmsResult>.Fail(result.Message ?? "Hatırlatma gönderilemedi."));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
