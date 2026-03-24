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
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        /// <summary>
        /// Giriş yapan kullanıcının profil bilgilerini getirir
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var profile = await _profileService.GetProfileAsync(GetUserId());
                return Ok(ApiResponse<ProfileDto>.Ok(profile));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Profil bilgileri alınamadı."));
            }
        }

        /// <summary>
        /// Profil bilgilerini günceller (ad, soyad, telefon, doğum tarihi)
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            try
            {
                var profile = await _profileService.UpdateProfileAsync(GetUserId(), dto);
                return Ok(ApiResponse<ProfileDto>.Ok(profile, "Profil başarıyla güncellendi."));
            }
            catch (Exception ex)
            {
                var message = ex.Message.Contains('|') ? ex.Message.Split('|')[1] : "Profil güncellenemedi.";
                return BadRequest(ApiResponse<object>.Fail(message));
            }
        }

        /// <summary>
        /// Şifre değiştirme
        /// </summary>
        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                await _profileService.ChangePasswordAsync(GetUserId(), dto);
                return Ok(ApiResponse<object>.Ok(null!, "Şifre başarıyla değiştirildi."));
            }
            catch (Exception ex)
            {
                var message = ex.Message.Contains('|') ? ex.Message.Split('|')[1] : "Şifre değiştirilemedi.";
                return BadRequest(ApiResponse<object>.Fail(message));
            }
        }

        /// <summary>
        /// Profil fotoğrafı yükleme (JPG, PNG, WebP - max 5MB)
        /// </summary>
        [HttpPost("picture")]
        [RequestSizeLimit(5 * 1024 * 1024)]
        public async Task<IActionResult> UploadPicture(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(ApiResponse<object>.Fail("Dosya seçilmedi."));

                var path = await _profileService.UploadProfilePictureAsync(GetUserId(), file);
                return Ok(ApiResponse<string>.Ok(path, "Profil fotoğrafı güncellendi."));
            }
            catch (Exception ex)
            {
                var message = ex.Message.Contains('|') ? ex.Message.Split('|')[1] : "Fotoğraf yüklenemedi.";
                return BadRequest(ApiResponse<object>.Fail(message));
            }
        }

        /// <summary>
        /// Profil fotoğrafını kaldırır
        /// </summary>
        [HttpDelete("picture")]
        public async Task<IActionResult> RemovePicture()
        {
            try
            {
                await _profileService.RemoveProfilePictureAsync(GetUserId());
                return Ok(ApiResponse<object>.Ok(null!, "Profil fotoğrafı kaldırıldı."));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Fotoğraf kaldırılamadı."));
            }
        }
    }
}
