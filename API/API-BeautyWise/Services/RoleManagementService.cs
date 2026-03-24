using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class RoleManagementService : IRoleManagementService
    {
        private readonly Context _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;

        private static readonly string[] ValidRoles = { "SuperAdmin", "Owner", "Admin", "Staff" };

        // SuperAdmin her şeyi atayabilir; Owner -> Owner, Admin, Staff; diğerleri atayamaz
        private static readonly Dictionary<string, HashSet<string>> AssignableRoles = new()
        {
            ["SuperAdmin"] = new HashSet<string> { "SuperAdmin", "Owner", "Admin", "Staff" },
            ["Owner"]      = new HashSet<string> { "Owner", "Admin", "Staff" },
        };

        public RoleManagementService(Context context, UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<StaffListDto> ChangeUserRoleAsync(int tenantId, int performedByUserId, ChangeRoleRequestDto dto)
        {
            // 1. Yeni rol geçerli mi?
            if (!ValidRoles.Contains(dto.NewRole))
                throw new InvalidOperationException("INVALID_ROLE");

            // 2. İşlemi yapan kullanıcıyı bul
            var performer = await _context.Users.FirstOrDefaultAsync(u => u.Id == performedByUserId);
            if (performer == null)
                throw new InvalidOperationException("PERFORMER_NOT_FOUND");

            var performerRoles = await _userManager.GetRolesAsync(performer);
            var performerHighestRole = GetHighestRole(performerRoles);

            // 3. İşlemi yapanın bu rolü atama yetkisi var mı?
            if (!AssignableRoles.ContainsKey(performerHighestRole))
                throw new UnauthorizedAccessException("NO_PERMISSION");

            if (!AssignableRoles[performerHighestRole].Contains(dto.NewRole))
                throw new UnauthorizedAccessException("CANNOT_ASSIGN_THIS_ROLE");

            // 4. Hedef kullanıcıyı bul (aynı tenant'ta olmalı)
            var targetUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == dto.TargetUserId && u.TenantId == tenantId && u.IsActive == true);
            if (targetUser == null)
                throw new InvalidOperationException("USER_NOT_FOUND");

            // 5. Kendi rolünü değiştiremez
            if (performedByUserId == dto.TargetUserId)
                throw new InvalidOperationException("CANNOT_CHANGE_OWN_ROLE");

            // 6. Mevcut rolleri al
            var currentRoles = await _userManager.GetRolesAsync(targetUser);
            var currentHighestRole = currentRoles.Count > 0 ? GetHighestRole(currentRoles) : "Staff";

            // 7. Aynı rol zaten atanmışsa işlem yapma
            if (currentRoles.Count == 1 && currentRoles[0] == dto.NewRole)
                throw new InvalidOperationException("ALREADY_HAS_ROLE");

            // 8. Owner'ın son Owner'ı başka role çevirme koruması
            if (currentRoles.Contains("Owner") && dto.NewRole != "Owner")
            {
                var ownerCount = await _context.Users
                    .Where(u => u.TenantId == tenantId && u.IsActive == true)
                    .CountAsync(u => _context.UserRoles
                        .Any(ur => ur.UserId == u.Id &&
                                   _context.Roles.Any(r => r.Id == ur.RoleId && r.Name == "Owner")));

                if (ownerCount <= 1)
                    throw new InvalidOperationException("LAST_OWNER_CANNOT_BE_CHANGED");
            }

            // 9. Tenant bilgisini al
            var tenant = await _context.Tenants.FindAsync(tenantId);

            // 10. Transaction içinde rol değişikliği + audit log
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Mevcut rolleri kaldır
                if (currentRoles.Count > 0)
                {
                    var removeResult = await _userManager.RemoveFromRolesAsync(targetUser, currentRoles);
                    if (!removeResult.Succeeded)
                        throw new InvalidOperationException("ROLE_REMOVE_FAILED");
                }

                // Yeni rolün var olduğundan emin ol
                if (!await _roleManager.RoleExistsAsync(dto.NewRole))
                    await _roleManager.CreateAsync(new AppRole { Name = dto.NewRole });

                // Yeni rolü ata
                var addResult = await _userManager.AddToRoleAsync(targetUser, dto.NewRole);
                if (!addResult.Succeeded)
                    throw new InvalidOperationException("ROLE_ADD_FAILED");

                // Audit log kayıtları oluştur
                var performerFullName = $"{performer.Name} {performer.Surname}".Trim();
                var targetFullName = $"{targetUser.Name} {targetUser.Surname}".Trim();
                var tenantName = tenant?.CompanyName ?? "";

                // Eski roller kaldırıldı
                foreach (var oldRole in currentRoles)
                {
                    _context.RoleChangeAuditLogs.Add(new RoleChangeAuditLog
                    {
                        TenantId = tenantId,
                        TargetUserId = targetUser.Id,
                        PerformedByUserId = performedByUserId,
                        ActionType = "RoleRemoved",
                        OldRole = oldRole,
                        NewRole = "",
                        Reason = dto.Reason,
                        TargetUserName = targetFullName,
                        PerformedByUserName = performerFullName,
                        TenantName = tenantName,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                // Yeni rol eklendi
                _context.RoleChangeAuditLogs.Add(new RoleChangeAuditLog
                {
                    TenantId = tenantId,
                    TargetUserId = targetUser.Id,
                    PerformedByUserId = performedByUserId,
                    ActionType = "RoleAdded",
                    OldRole = currentHighestRole,
                    NewRole = dto.NewRole,
                    Reason = dto.Reason,
                    TargetUserName = targetFullName,
                    PerformedByUserName = performerFullName,
                    TenantName = tenantName,
                    CreatedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            // 11. Güncellenmiş staff bilgisini döndür
            var updatedRoles = await _userManager.GetRolesAsync(targetUser);
            return new StaffListDto
            {
                Id = targetUser.Id,
                Name = targetUser.Name,
                Surname = targetUser.Surname,
                Email = targetUser.Email ?? "",
                Phone = targetUser.PhoneNumber,
                BirthDate = targetUser.BirthDate,
                Roles = updatedRoles.ToList(),
                IsActive = targetUser.IsActive ?? false,
                IsApproved = targetUser.IsApproved,
                DefaultCommissionRate = targetUser.DefaultCommissionRate,
                CDate = targetUser.CDate
            };
        }

        public async Task<PaginatedResultDto<RoleChangeAuditLogDto>> GetAuditLogsAsync(AuditLogFilterDto filter)
        {
            var query = _context.RoleChangeAuditLogs.AsQueryable();

            // Filtreler
            if (filter.TenantId.HasValue)
                query = query.Where(l => l.TenantId == filter.TenantId.Value);

            if (filter.TargetUserId.HasValue)
                query = query.Where(l => l.TargetUserId == filter.TargetUserId.Value);

            if (filter.PerformedByUserId.HasValue)
                query = query.Where(l => l.PerformedByUserId == filter.PerformedByUserId.Value);

            if (!string.IsNullOrWhiteSpace(filter.ActionType))
                query = query.Where(l => l.ActionType == filter.ActionType);

            if (!string.IsNullOrWhiteSpace(filter.RoleName))
                query = query.Where(l => l.OldRole == filter.RoleName || l.NewRole == filter.RoleName);

            if (filter.StartDate.HasValue)
                query = query.Where(l => l.CreatedAt >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(l => l.CreatedAt <= filter.EndDate.Value);

            // Toplam sayı
            var totalCount = await query.CountAsync();

            // Sayfalama
            var page = Math.Max(1, filter.Page);
            var pageSize = Math.Clamp(filter.PageSize, 1, 200);

            var items = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new RoleChangeAuditLogDto
                {
                    Id = l.Id,
                    TenantId = l.TenantId,
                    TenantName = l.TenantName,
                    TargetUserId = l.TargetUserId,
                    TargetUserName = l.TargetUserName,
                    PerformedByUserId = l.PerformedByUserId,
                    PerformedByUserName = l.PerformedByUserName,
                    ActionType = l.ActionType,
                    OldRole = l.OldRole,
                    NewRole = l.NewRole,
                    Reason = l.Reason,
                    CreatedAt = l.CreatedAt
                })
                .ToListAsync();

            return new PaginatedResultDto<RoleChangeAuditLogDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        /// <summary>Yetki hiyerarşisine göre en yüksek rolü döndürür</summary>
        private static string GetHighestRole(IList<string> roles)
        {
            if (roles.Contains("SuperAdmin")) return "SuperAdmin";
            if (roles.Contains("Owner")) return "Owner";
            if (roles.Contains("Admin")) return "Admin";
            return "Staff";
        }
    }
}
