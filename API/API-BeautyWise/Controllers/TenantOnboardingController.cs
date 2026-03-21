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

        public TenantOnboardingController(ITenantOnboardingService tenantOnboardingService)
        {
            _tenantOnboardingService = tenantOnboardingService;
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
            catch (Exception ex)
            {
                var parts        = ex.Message.Split('|');
                var errorCode    = parts.Length > 1 ? parts[0] : "ERROR";
                var errorMessage = parts.Length > 1 ? parts[1] : ex.Message;
                return BadRequest(ApiResponse<object>.Fail(errorMessage, errorCode));
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
        public async Task<ActionResult<ApiResponse<string>>> CreateInviteToken(
            [FromBody] string? emailToInvite)
        {
            try
            {
                var tenantIdClaim = User.FindFirstValue("tenantId");
                if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId))
                    return Unauthorized(ApiResponse<object>.Fail("Gecersiz token: tenantId bulunamadi."));

                var token = await _tenantOnboardingService.CreateInviteTokenAsync(tenantId, emailToInvite);

                return Ok(ApiResponse<string>.Ok(
                    token,
                    "Davet kodu olusturuldu. 24 saat icerisinde tek kullanimlik kullanilabilir."));
            }
            catch (Exception ex)
            {
                var parts        = ex.Message.Split('|');
                var errorMessage = parts.Length > 1 ? parts[1] : ex.Message;
                return BadRequest(ApiResponse<object>.Fail(errorMessage));
            }
        }
    }
}
