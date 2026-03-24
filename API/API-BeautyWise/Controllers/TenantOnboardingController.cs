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
    public class TenantOnboardingController : ControllerBase
    {
        private readonly ITenantOnboardingService _tenantOnboardingService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ISubscriptionService _subscriptionService;

        public TenantOnboardingController(
            ITenantOnboardingService tenantOnboardingService,
            IEmailService emailService,
            IConfiguration configuration,
            ISubscriptionService subscriptionService)
        {
            _tenantOnboardingService = tenantOnboardingService;
            _emailService = emailService;
            _configuration = configuration;
            _subscriptionService = subscriptionService;
        }

        /// <summary>
        /// Guzellik merkezi kayit (Tenant + Owner kullanici olusturma).
        /// PUBLIC - Login gerekmez.
        /// POST /api/tenantonboarding/register-tenant
        ///
        /// Kayit sonrasi donus: TenantId, UserId
        /// Sonraki adim: /api/auth/login ile giris yapin ve JWT alin.
        /// </summary>
        [HttpPost("register-tenant")]
        public async Task<ActionResult<ApiResponse<TenantOnboardingResultDto>>> Register(
            [FromBody] TenantOnboardingDto dto)
        {
            try
            {
                var result = await _tenantOnboardingService.RegisterTenantAsync(dto);
                return Ok(ApiResponse<TenantOnboardingResultDto>.Ok(
                    result,
                    "Kayit basarili. Lutfen giris yaparak sistemi kullanmaya baslayin."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Tenant temel bilgilerini dondurur (CompanyName, Address, Phone).
        /// [Authorize] JWT gerekli.
        /// GET /api/tenantonboarding/info
        /// </summary>
        [HttpGet("info")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<TenantInfoDto>>> GetTenantInfo()
        {
            try
            {
                var tenantIdClaim = User.FindFirstValue("tenantId");
                if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
                    return Unauthorized(ApiResponse<object>.Fail("Gecersiz token: tenantId bulunamadi."));

                var info = await _tenantOnboardingService.GetTenantInfoAsync(tenantId);
                if (info == null)
                    return NotFound(ApiResponse<object>.Fail("Tenant bulunamadi."));

                return Ok(ApiResponse<TenantInfoDto>.Ok(info));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Personel davet kodu olusturur.
        /// [Owner veya Admin] JWT gerekli.
        /// POST /api/tenantonboarding/invite-token
        /// Body: email adresi (string, opsiyonel - bos birakilabilir)
        ///
        /// Donen token 24 saat gecerlidir ve tek kullanimdir.
        /// Personel bu token ile /api/auth/register endpoint'ini kullanir.
        /// </summary>
        [HttpPost("invite-token")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<ActionResult<ApiResponse<InviteTokenResultDto>>> CreateInviteToken(
            [FromBody] string? emailToInvite)
        {
            try
            {
                var tenantIdClaim = User.FindFirstValue("tenantId");
                if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
                    return Unauthorized(ApiResponse<object>.Fail("Gecersiz token: tenantId bulunamadi."));

                // Personel limit kontrolü
                var (canAdd, currentCount, maxCount, limitError) = await _subscriptionService.CanAddStaffAsync(tenantId);
                if (!canAdd)
                {
                    return BadRequest(ApiResponse<object>.Fail(
                        limitError ?? "Paket limitinize ulaştınız.",
                        "STAFF_LIMIT_REACHED"));
                }

                var token = await _tenantOnboardingService.CreateInviteTokenAsync(tenantId, emailToInvite);

                var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                var registerUrl = $"{frontendUrl}/register?invite={Uri.EscapeDataString(token)}";
                if (!string.IsNullOrWhiteSpace(emailToInvite))
                    registerUrl += $"&email={Uri.EscapeDataString(emailToInvite)}";

                bool emailSent = false;
                if (!string.IsNullOrWhiteSpace(emailToInvite))
                {
                    try
                    {
                        var tenant = await _tenantOnboardingService.GetTenantNameAsync(tenantId);
                        await _emailService.SendInviteEmailAsync(emailToInvite, token, tenant, frontendUrl);
                        emailSent = true;
                    }
                    catch
                    {
                        // Email gönderilemese bile token oluşturuldu, devam et
                    }
                }

                return Ok(ApiResponse<InviteTokenResultDto>.Ok(
                    new InviteTokenResultDto
                    {
                        Token = token,
                        RegisterUrl = registerUrl,
                        EmailSent = emailSent
                    },
                    emailSent
                        ? "Davet kodu oluşturuldu ve e-posta gönderildi."
                        : "Davet kodu oluşturuldu. 24 saat içerisinde tek kullanımlık kullanılabilir."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
