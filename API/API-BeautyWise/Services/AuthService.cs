using API_BeautyWise.DTO;
using API_BeautyWise.Helpers.Interface;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class AuthService : IAuthService
    {
        private readonly Context _context;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly LogService _logService;
        private readonly ITenantIdentifierGenerator _tenantIdentifierGenerator;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthService(
        Context context,
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        RoleManager<AppRole> roleManager,
        LogService logService,
        IJwtTokenGenerator jwtTokenGenerator)
        {
            _context = context;
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _logService = logService;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<(bool Success, string Message, LoginResultDto? Data)> LoginAsync(LoginRequestDto dto)
        {//Genel Login işlemi
            try
            {
                var user = await _userManager.FindByEmailAsync(dto.EmailOrUsername)
                           ?? await _userManager.FindByNameAsync(dto.EmailOrUsername);

                if (user == null)
                    return (false, "Kullanıcı bulunamadı.", null);

                var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
                if (!result.Succeeded)
                    return (false, "Şifre hatalı.", null);

                var roles = await _userManager.GetRolesAsync(user);
                var token = await _jwtTokenGenerator.GenerateAsync(user);

                return (true, "Giriş başarılı.", new LoginResultDto
                {
                    Token = token,
                    Name = user.Name,
                    Surname = user.Surname,
                    Email = user.Email ?? "",
                    Roles = roles.ToList()
                });
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception = ex,
                    LogLevel = LogLevel.Error,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Action = nameof(LoginAsync),
                    Controller = nameof(AuthService),
                    Endpoint = "POST /api/auth/login",
                    Timestamp = DateTime.Now,
                    UserId = null 
                });

                throw;
            }
        }

        public async Task<int> RegisterStaffAsync(StaffRegisterDto dto)
        {//Personel kayıt işlemi (Davet kodu ile)
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                if (dto.Password != dto.ConfirmPassword)
                    throw new Exception("PASSWORD_MISMATCH|Şifreler eşleşmiyor.");

                var invite = await ValidateInviteTokenAsync(dto.InviteToken);

                var user = new AppUser
                {
                    UserName = dto.Email,
                    Email = dto.Email,
                    Name = dto.Name,
                    Surname = dto.Surname,
                    BirthDate = dto.BirthDate,
                    TenantId = invite.TenantId, 
                    IsActive = true,
                    IsApproved = true,
                    CDate = DateTime.UtcNow
                };

                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                {
                    var error = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new Exception($"USER_CREATE_FAILED|{error}");
                }

                if (!await _roleManager.RoleExistsAsync("Staff"))
                {
                    var roleResult = await _roleManager.CreateAsync(new AppRole { Name = "Staff" });
                    if (!roleResult.Succeeded)
                    {
                        var roleError = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                        throw new Exception($"ROLE_CREATE_FAILED|{roleError}");
                    }
                }

                await _userManager.AddToRoleAsync(user, "Staff");
                await MarkInviteTokenAsUsedAsync(invite);
                await tx.CommitAsync();
                return user.Id;
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();

                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception = ex,
                    LogLevel = LogLevel.Error,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Action = nameof(RegisterStaffAsync),
                    Controller = nameof(AuthService),
                    Endpoint = "POST /api/authservice/register",
                    Timestamp = DateTime.Now,
                    UserId = null
                });

                throw;
            }
        }


        // ======================================
        // DAVET KODU DOĞRULAMA (AYRI METHOD)
        // ======================================
        private async Task<TenantInviteToken> ValidateInviteTokenAsync(string tokenCode)
        {
            try
            {
                var invite = await _context.TenantInviteTokens
                    .FirstOrDefaultAsync(x =>
                        x.TokenCode == tokenCode &&
                        !x.IsUsed &&
                        x.ExpireDate >= DateTime.UtcNow);

                if (invite == null)
                    throw new Exception("INVALID_INVITE_TOKEN | Davet kodu geçersiz veya süresi dolmuş.");

                return invite;
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception = ex,
                    LogLevel = LogLevel.Error,
                    StatusCode = StatusCodes.Status400BadRequest,
                    Action = nameof(ValidateInviteTokenAsync),
                    Controller = nameof(AuthService),
                    Endpoint = "INTERNAL",
                    Timestamp = DateTime.Now,
                    UserId = null
                });

                throw;
            }
        }

        // ======================================
        // DAVET KODU USED YAPMA (AYRI METHOD)
        // ======================================
        private async Task MarkInviteTokenAsUsedAsync(TenantInviteToken invite)
        {
            try
            {
                invite.IsUsed = true;
                invite.UDate = DateTime.UtcNow;

                _context.TenantInviteTokens.Update(invite);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception = ex,
                    LogLevel = LogLevel.Error,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Action = nameof(MarkInviteTokenAsUsedAsync),
                    Controller = nameof(AuthService),
                    Endpoint = "INTERNAL",
                    Timestamp = DateTime.Now,
                    UserId = null
                });

                throw;
            }
        }
    }
}
