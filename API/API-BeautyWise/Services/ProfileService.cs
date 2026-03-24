using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Identity;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace API_BeautyWise.Services
{
    public class ProfileService : IProfileService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IWebHostEnvironment _env;
        private readonly LogService _logService;

        public ProfileService(
            UserManager<AppUser> userManager,
            IWebHostEnvironment env,
            LogService logService)
        {
            _userManager = userManager;
            _env = env;
            _logService = logService;
        }

        public async Task<ProfileDto> GetProfileAsync(int userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null)
                    throw new Exception("USER_NOT_FOUND|Kullanıcı bulunamadı.");

                var roles = await _userManager.GetRolesAsync(user);

                return new ProfileDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Surname = user.Surname,
                    Email = user.Email ?? "",
                    Phone = user.PhoneNumber,
                    BirthDate = user.BirthDate,
                    ProfilePicturePath = user.ProfilePicturePath,
                    Roles = roles.ToList()
                };
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception = ex,
                    LogLevel = LogLevel.Error,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Action = nameof(GetProfileAsync),
                    Controller = nameof(ProfileService),
                    Endpoint = "GET /api/profile",
                    Timestamp = DateTime.Now,
                    UserId = userId
                });
                throw;
            }
        }

        public async Task<ProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null)
                    throw new Exception("USER_NOT_FOUND|Kullanıcı bulunamadı.");

                user.Name = dto.Name;
                user.Surname = dto.Surname;
                user.PhoneNumber = dto.Phone;
                user.BirthDate = dto.BirthDate;
                user.UDate = DateTime.UtcNow;
                user.UUser = userId;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    var error = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new Exception($"UPDATE_FAILED|{error}");
                }

                var roles = await _userManager.GetRolesAsync(user);

                return new ProfileDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Surname = user.Surname,
                    Email = user.Email ?? "",
                    Phone = user.PhoneNumber,
                    BirthDate = user.BirthDate,
                    ProfilePicturePath = user.ProfilePicturePath,
                    Roles = roles.ToList()
                };
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception = ex,
                    LogLevel = LogLevel.Error,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Action = nameof(UpdateProfileAsync),
                    Controller = nameof(ProfileService),
                    Endpoint = "PUT /api/profile",
                    Timestamp = DateTime.Now,
                    UserId = userId
                });
                throw;
            }
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            try
            {
                if (dto.NewPassword != dto.ConfirmNewPassword)
                    throw new Exception("PASSWORD_MISMATCH|Şifreler eşleşmiyor.");

                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null)
                    throw new Exception("USER_NOT_FOUND|Kullanıcı bulunamadı.");

                var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
                if (!result.Succeeded)
                {
                    var error = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new Exception($"PASSWORD_CHANGE_FAILED|{error}");
                }
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception = ex,
                    LogLevel = LogLevel.Error,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Action = nameof(ChangePasswordAsync),
                    Controller = nameof(ProfileService),
                    Endpoint = "PUT /api/profile/password",
                    Timestamp = DateTime.Now,
                    UserId = userId
                });
                throw;
            }
        }

        public async Task<string> UploadProfilePictureAsync(int userId, IFormFile file)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null)
                    throw new Exception("USER_NOT_FOUND|Kullanıcı bulunamadı.");

                // Validate file
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(ext))
                    throw new Exception("INVALID_FILE|Sadece JPG, JPEG, PNG ve WebP dosyaları kabul edilir.");

                if (file.Length > 5 * 1024 * 1024) // 5MB max
                    throw new Exception("FILE_TOO_LARGE|Dosya boyutu en fazla 5MB olabilir.");

                // Create directory if not exists
                var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "profilePictures");
                Directory.CreateDirectory(uploadsDir);

                // Delete old picture if exists
                if (!string.IsNullOrEmpty(user.ProfilePicturePath))
                {
                    var oldFilePath = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), user.ProfilePicturePath.TrimStart('/'));
                    if (File.Exists(oldFilePath))
                        File.Delete(oldFilePath);
                }

                // Process and save as WebP
                var fileName = $"{userId}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}.webp";
                var filePath = Path.Combine(uploadsDir, fileName);

                using (var stream = file.OpenReadStream())
                using (var image = await Image.LoadAsync(stream))
                {
                    // Resize to max 300x300, keeping aspect ratio
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(300, 300),
                        Mode = ResizeMode.Max
                    }));

                    await image.SaveAsWebpAsync(filePath, new WebpEncoder
                    {
                        Quality = 80
                    });
                }

                // Update user
                var relativePath = $"/profilePictures/{fileName}";
                user.ProfilePicturePath = relativePath;
                user.UDate = DateTime.UtcNow;
                user.UUser = userId;
                await _userManager.UpdateAsync(user);

                return relativePath;
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception = ex,
                    LogLevel = LogLevel.Error,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Action = nameof(UploadProfilePictureAsync),
                    Controller = nameof(ProfileService),
                    Endpoint = "POST /api/profile/picture",
                    Timestamp = DateTime.Now,
                    UserId = userId
                });
                throw;
            }
        }

        public async Task RemoveProfilePictureAsync(int userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null)
                    throw new Exception("USER_NOT_FOUND|Kullanıcı bulunamadı.");

                if (!string.IsNullOrEmpty(user.ProfilePicturePath))
                {
                    var filePath = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), user.ProfilePicturePath.TrimStart('/'));
                    if (File.Exists(filePath))
                        File.Delete(filePath);
                }

                user.ProfilePicturePath = null;
                user.UDate = DateTime.UtcNow;
                user.UUser = userId;
                await _userManager.UpdateAsync(user);
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception = ex,
                    LogLevel = LogLevel.Error,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Action = nameof(RemoveProfilePictureAsync),
                    Controller = nameof(ProfileService),
                    Endpoint = "DELETE /api/profile/picture",
                    Timestamp = DateTime.Now,
                    UserId = userId
                });
                throw;
            }
        }
    }
}
