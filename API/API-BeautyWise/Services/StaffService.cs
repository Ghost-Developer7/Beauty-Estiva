using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class StaffService : IStaffService
    {
        private readonly Context _context;
        private readonly UserManager<AppUser> _userManager;

        public StaffService(Context context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<List<StaffListDto>> GetStaffListAsync(int tenantId)
        {
            var users = await _context.Users
                .Where(u => u.TenantId == tenantId && u.IsActive == true)
                .OrderBy(u => u.Name)
                .ThenBy(u => u.Surname)
                .ToListAsync();

            var result = new List<StaffListDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                result.Add(new StaffListDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Surname = user.Surname,
                    Email = user.Email ?? "",
                    Phone = user.PhoneNumber,
                    BirthDate = user.BirthDate,
                    Roles = roles.ToList(),
                    IsActive = user.IsActive ?? false,
                    IsApproved = user.IsApproved,
                    DefaultCommissionRate = user.DefaultCommissionRate,
                    CDate = user.CDate
                });
            }

            return result;
        }

        public async Task<StaffListDto?> GetStaffByIdAsync(int tenantId, int staffId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == staffId && u.TenantId == tenantId && u.IsActive == true);

            if (user == null) return null;

            var roles = await _userManager.GetRolesAsync(user);

            return new StaffListDto
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Email = user.Email ?? "",
                Phone = user.PhoneNumber,
                BirthDate = user.BirthDate,
                Roles = roles.ToList(),
                IsActive = user.IsActive ?? false,
                IsApproved = user.IsApproved,
                CDate = user.CDate
            };
        }
    }
}
