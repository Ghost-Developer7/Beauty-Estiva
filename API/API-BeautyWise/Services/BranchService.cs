using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class BranchService : IBranchService
    {
        private readonly Context _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly ISubscriptionService _subscriptionService;

        public BranchService(
            Context context,
            UserManager<AppUser> userManager,
            ISubscriptionService subscriptionService)
        {
            _context = context;
            _userManager = userManager;
            _subscriptionService = subscriptionService;
        }

        public async Task<List<BranchListDto>> GetBranchesAsync(int tenantId)
        {
            return await _context.Branches
                .Where(b => b.TenantId == tenantId)
                .OrderByDescending(b => b.IsMainBranch)
                .ThenBy(b => b.Name)
                .Select(b => new BranchListDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Address = b.Address,
                    Phone = b.Phone,
                    Email = b.Email,
                    IsMainBranch = b.IsMainBranch,
                    IsActive = b.IsActive ?? true,
                    StaffCount = b.Staff.Count(s => s.IsActive == true),
                    CDate = b.CDate
                })
                .ToListAsync();
        }

        public async Task<BranchDetailDto?> GetBranchByIdAsync(int tenantId, int branchId)
        {
            var branch = await _context.Branches
                .Include(b => b.Staff)
                .FirstOrDefaultAsync(b => b.Id == branchId && b.TenantId == tenantId);

            if (branch == null) return null;

            var staffDtos = new List<BranchStaffDto>();
            foreach (var user in branch.Staff.Where(s => s.IsActive == true))
            {
                var roles = await _userManager.GetRolesAsync(user);
                staffDtos.Add(new BranchStaffDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Surname = user.Surname,
                    Email = user.Email ?? "",
                    Roles = roles.ToList()
                });
            }

            return new BranchDetailDto
            {
                Id = branch.Id,
                Name = branch.Name,
                Address = branch.Address,
                Phone = branch.Phone,
                Email = branch.Email,
                WorkingHoursJson = branch.WorkingHoursJson,
                IsMainBranch = branch.IsMainBranch,
                IsActive = branch.IsActive ?? true,
                StaffCount = staffDtos.Count,
                CDate = branch.CDate,
                Staff = staffDtos
            };
        }

        public async Task<BranchListDto> CreateBranchAsync(int tenantId, CreateBranchDto dto, int userId)
        {
            // Check subscription limit
            var limit = await GetBranchLimitAsync(tenantId);
            if (!limit.CanAdd)
                throw new InvalidOperationException("BRANCH_LIMIT_REACHED");

            // If this is set as main branch, clear existing main branch
            if (dto.IsMainBranch)
            {
                await ClearMainBranchFlagAsync(tenantId);
            }

            var branch = new Branch
            {
                TenantId = tenantId,
                Name = dto.Name,
                Address = dto.Address,
                Phone = dto.Phone,
                Email = dto.Email,
                WorkingHoursJson = dto.WorkingHoursJson,
                IsMainBranch = dto.IsMainBranch,
                IsActive = true,
                CUser = userId,
                CDate = DateTime.Now
            };

            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();

            return new BranchListDto
            {
                Id = branch.Id,
                Name = branch.Name,
                Address = branch.Address,
                Phone = branch.Phone,
                Email = branch.Email,
                IsMainBranch = branch.IsMainBranch,
                IsActive = true,
                StaffCount = 0,
                CDate = branch.CDate
            };
        }

        public async Task<BranchListDto?> UpdateBranchAsync(int tenantId, int branchId, UpdateBranchDto dto, int userId)
        {
            var branch = await _context.Branches
                .Include(b => b.Staff)
                .FirstOrDefaultAsync(b => b.Id == branchId && b.TenantId == tenantId);

            if (branch == null) return null;

            // If this is set as main branch, clear existing main branch
            if (dto.IsMainBranch && !branch.IsMainBranch)
            {
                await ClearMainBranchFlagAsync(tenantId);
            }

            branch.Name = dto.Name;
            branch.Address = dto.Address;
            branch.Phone = dto.Phone;
            branch.Email = dto.Email;
            branch.WorkingHoursJson = dto.WorkingHoursJson;
            branch.IsMainBranch = dto.IsMainBranch;
            branch.IsActive = dto.IsActive;
            branch.UUser = userId;
            branch.UDate = DateTime.Now;

            await _context.SaveChangesAsync();

            return new BranchListDto
            {
                Id = branch.Id,
                Name = branch.Name,
                Address = branch.Address,
                Phone = branch.Phone,
                Email = branch.Email,
                IsMainBranch = branch.IsMainBranch,
                IsActive = branch.IsActive ?? true,
                StaffCount = branch.Staff.Count(s => s.IsActive == true),
                CDate = branch.CDate
            };
        }

        public async Task<bool> DeactivateBranchAsync(int tenantId, int branchId, int userId)
        {
            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == branchId && b.TenantId == tenantId);

            if (branch == null) return false;

            // Cannot deactivate the main branch
            if (branch.IsMainBranch)
                throw new InvalidOperationException("CANNOT_DEACTIVATE_MAIN_BRANCH");

            branch.IsActive = false;
            branch.UUser = userId;
            branch.UDate = DateTime.Now;

            // Unassign staff from deactivated branch
            var assignedStaff = await _context.Users
                .Where(u => u.BranchId == branchId && u.TenantId == tenantId)
                .ToListAsync();

            foreach (var user in assignedStaff)
            {
                user.BranchId = null;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AssignStaffAsync(int tenantId, int branchId, int staffId, int userId)
        {
            var branch = await _context.Branches
                .FirstOrDefaultAsync(b => b.Id == branchId && b.TenantId == tenantId && b.IsActive == true);

            if (branch == null) return false;

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == staffId && u.TenantId == tenantId && u.IsActive == true);

            if (user == null) return false;

            user.BranchId = branchId;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveStaffAsync(int tenantId, int branchId, int staffId, int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == staffId && u.TenantId == tenantId && u.BranchId == branchId);

            if (user == null) return false;

            user.BranchId = null;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BranchLimitDto> GetBranchLimitAsync(int tenantId)
        {
            var plan = await _subscriptionService.GetEffectivePlanAsync(tenantId);
            if (plan == null)
            {
                return new BranchLimitDto
                {
                    CurrentCount = 0,
                    MaxCount = 0,
                    CanAdd = false,
                    Message = "Aktif aboneliginiz bulunmuyor. Lutfen bir plan satin alin."
                };
            }

            var currentCount = await _context.Branches
                .Where(b => b.TenantId == tenantId && b.IsActive == true)
                .CountAsync();

            // -1 or 0 = unlimited
            if (plan.MaxBranchCount <= 0)
            {
                return new BranchLimitDto
                {
                    CurrentCount = currentCount,
                    MaxCount = -1,
                    CanAdd = true
                };
            }

            var canAdd = currentCount < plan.MaxBranchCount;

            return new BranchLimitDto
            {
                CurrentCount = currentCount,
                MaxCount = plan.MaxBranchCount,
                CanAdd = canAdd,
                Message = canAdd ? null : $"Paket limitinize ulastiniz ({currentCount}/{plan.MaxBranchCount} sube). Daha fazla sube eklemek icin paketinizi yukseltmeniz gerekmektedir."
            };
        }

        public async Task CreateMainBranchForTenantAsync(int tenantId, string companyName, int userId)
        {
            var existsAny = await _context.Branches
                .AnyAsync(b => b.TenantId == tenantId);

            if (existsAny) return; // Already has branches

            var mainBranch = new Branch
            {
                TenantId = tenantId,
                Name = "Merkez Sube",
                IsMainBranch = true,
                IsActive = true,
                CUser = userId,
                CDate = DateTime.Now
            };

            _context.Branches.Add(mainBranch);
            await _context.SaveChangesAsync();
        }

        // ── Helpers ──

        private async Task ClearMainBranchFlagAsync(int tenantId)
        {
            var currentMain = await _context.Branches
                .Where(b => b.TenantId == tenantId && b.IsMainBranch)
                .ToListAsync();

            foreach (var b in currentMain)
            {
                b.IsMainBranch = false;
            }
        }
    }
}
