using API_BeautyWise.DTO;
using API_BeautyWise.Helpers.Interface;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class TenantOnboardingService : ITenantOnboardingService
    {
        private readonly Context _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;
        private readonly LogService _logService;
        private readonly ITenantIdentifierGenerator _tenantIdentifierGenerator;
        private readonly IBranchService _branchService;

        public TenantOnboardingService(
            Context context,
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager,
            LogService logService,
            ITenantIdentifierGenerator tenantIdentifierGenerator,
            IBranchService branchService)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
            _logService = logService;
            _tenantIdentifierGenerator = tenantIdentifierGenerator;
            _branchService = branchService;
        }
        public async Task<TenantOnboardingResultDto> RegisterTenantAsync(TenantOnboardingDto dto)
        {//Firma sahibinin ve Firmanın ilk kayıt işlemii
            using var tx = await _context.Database.BeginTransactionAsync();

            try
            {
                var tenant = new Tenant
                {
                    CompanyName = dto.CompanyName,
                    Phone = dto.Phone,
                    Address = dto.Address,
                    TaxNumber = dto.TaxNumber,
                    TaxOffice = dto.TaxOffice,
                    TenantUUID = _tenantIdentifierGenerator.GenerateTenantUuid(),
                    CDate = DateTime.Now,
                    IsActive = true
                };

                _context.Tenants.Add(tenant);
                await _context.SaveChangesAsync();

                if (dto.Password != dto.ConfirmPassword)
                {
                    throw new Exception("PASSWORD_MISMATCH | Şifreler eşleşmiyor.");
                }
                var user = new AppUser
                {
                    UserName = dto.Email,
                    Email = dto.Email,
                    Name = dto.Name,
                    Surname = dto.Surname,
                    TenantId = tenant.Id,
                    IsActive = true,
                    IsApproved = true,
                    CDate = DateTime.Now
                };

                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                {
                    var errorMessage = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new Exception($"USER_CREATE_FAILED|{errorMessage}");
                }


                if (!await _roleManager.RoleExistsAsync("Owner"))
                    await _roleManager.CreateAsync(new AppRole { Name = "Owner" });

                await _userManager.AddToRoleAsync(user, "Owner");

                // Auto-create main branch for the new tenant
                await _branchService.CreateMainBranchForTenantAsync(tenant.Id, tenant.CompanyName, user.Id);

                await tx.CommitAsync();
                return new TenantOnboardingResultDto
                {
                    TenantId = tenant.Id,
                    UserId = user.Id
                };
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception = ex,
                    LogLevel = LogLevel.Error,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Action = nameof(RegisterTenantAsync),
                    Controller = nameof(TenantOnboardingService),
                    Endpoint = "POST /api/onboarding/register-tenant",
                    Timestamp = DateTime.Now,
                    UserId = null
                });
                throw;
            }
        }

        public async Task<string> CreateInviteTokenAsync(int tenantId, string? emailToInvite = null)
        {
            try
            {
                var tenantExists = await _context.Tenants.AnyAsync(t => t.Id == tenantId && t.IsActive == true);
                if (!tenantExists)
                    throw new Exception("TENANT_NOT_FOUND | Geçerli bir işletme bulunamadı.");


                var tokenCode = _tenantIdentifierGenerator.GenerateTenantUuid().ToString();

                var inviteToken = new TenantInviteToken
                {
                    TokenCode = tokenCode,
                    EmailToInvite = emailToInvite,
                    TenantId = tenantId,
                    ExpireDate = DateTime.Now.AddDays(1), 
                    IsUsed = false,
                    CDate = DateTime.Now,
                    IsActive = true
                };

                _context.TenantInviteTokens.Add(inviteToken);
                await _context.SaveChangesAsync();

                return tokenCode;
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception = ex,
                    LogLevel = LogLevel.Error,
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Action = nameof(CreateInviteTokenAsync),
                    Controller = nameof(TenantOnboardingService),
                    Endpoint = "POST /api/tenant/invite-token",
                    Timestamp = DateTime.Now,
                    UserId = null
                });

                throw;
            }
        }


        public async Task<string> GetTenantNameAsync(int tenantId)
        {
            var tenant = await _context.Tenants
                .Where(t => t.Id == tenantId)
                .Select(t => t.CompanyName)
                .FirstOrDefaultAsync();
            return tenant ?? "Beauty Estiva";
        }

        public async Task<TenantInfoDto?> GetTenantInfoAsync(int tenantId)
        {
            var tenant = await _context.Tenants
                .Where(t => t.Id == tenantId && t.IsActive == true)
                .Select(t => new TenantInfoDto
                {
                    CompanyName = t.CompanyName,
                    Address = t.Address,
                    Phone = t.Phone
                })
                .FirstOrDefaultAsync();
            return tenant;
        }
    }
}
