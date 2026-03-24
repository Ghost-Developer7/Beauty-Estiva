using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class StaffHRInfoService : IStaffHRInfoService
    {
        private readonly Context _context;
        private readonly UserManager<AppUser> _userManager;

        public StaffHRInfoService(Context context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<StaffHRInfoDto?> GetHRInfoAsync(int tenantId, int staffId)
        {
            var staff = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == staffId && u.TenantId == tenantId && u.IsActive == true);

            if (staff == null) return null;

            var hrInfo = await _context.StaffHRInfos
                .FirstOrDefaultAsync(h => h.TenantId == tenantId && h.StaffId == staffId && h.IsActive == true);

            return new StaffHRInfoDto
            {
                Id = hrInfo?.Id ?? 0,
                StaffId = staffId,
                StaffFullName = $"{staff.Name} {staff.Surname}",
                HireDate = hrInfo?.HireDate,
                Position = hrInfo?.Position,
                Salary = hrInfo?.Salary,
                SalaryCurrency = hrInfo?.SalaryCurrency ?? "TRY",
                IdentityNumber = hrInfo?.IdentityNumber,
                EmergencyContactName = hrInfo?.EmergencyContactName,
                EmergencyContactPhone = hrInfo?.EmergencyContactPhone,
                AnnualLeaveEntitlement = hrInfo?.AnnualLeaveEntitlement ?? 14,
                UsedLeaveDays = hrInfo?.UsedLeaveDays ?? 0,
                RemainingLeaveDays = (hrInfo?.AnnualLeaveEntitlement ?? 14) - (hrInfo?.UsedLeaveDays ?? 0),
                Notes = hrInfo?.Notes
            };
        }

        public async Task UpsertHRInfoAsync(int tenantId, int staffId, StaffHRInfoUpdateDto dto)
        {
            var staff = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == staffId && u.TenantId == tenantId && u.IsActive == true);

            if (staff == null)
                throw new Exception("NOT_FOUND|Personel bulunamadi.");

            var hrInfo = await _context.StaffHRInfos
                .FirstOrDefaultAsync(h => h.TenantId == tenantId && h.StaffId == staffId && h.IsActive == true);

            if (hrInfo == null)
            {
                hrInfo = new StaffHRInfo
                {
                    TenantId = tenantId,
                    StaffId = staffId,
                    IsActive = true,
                    CDate = DateTime.Now
                };
                _context.StaffHRInfos.Add(hrInfo);
            }

            if (dto.HireDate.HasValue) hrInfo.HireDate = dto.HireDate;
            if (dto.Position != null) hrInfo.Position = dto.Position;
            if (dto.Salary.HasValue) hrInfo.Salary = dto.Salary;
            if (dto.SalaryCurrency != null) hrInfo.SalaryCurrency = dto.SalaryCurrency;
            if (dto.IdentityNumber != null) hrInfo.IdentityNumber = dto.IdentityNumber;
            if (dto.EmergencyContactName != null) hrInfo.EmergencyContactName = dto.EmergencyContactName;
            if (dto.EmergencyContactPhone != null) hrInfo.EmergencyContactPhone = dto.EmergencyContactPhone;
            if (dto.AnnualLeaveEntitlement.HasValue) hrInfo.AnnualLeaveEntitlement = dto.AnnualLeaveEntitlement.Value;
            if (dto.Notes != null) hrInfo.Notes = dto.Notes;

            hrInfo.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        public async Task<List<StaffHRSummaryDto>> GetHRSummaryAsync(int tenantId)
        {
            var staffMembers = await _context.Users
                .Where(u => u.TenantId == tenantId && u.IsActive == true)
                .OrderBy(u => u.Name).ThenBy(u => u.Surname)
                .ToListAsync();

            var hrInfos = await _context.StaffHRInfos
                .Where(h => h.TenantId == tenantId && h.IsActive == true)
                .ToListAsync();

            var result = new List<StaffHRSummaryDto>();

            foreach (var staff in staffMembers)
            {
                var roles = await _userManager.GetRolesAsync(staff);
                var hr = hrInfos.FirstOrDefault(h => h.StaffId == staff.Id);

                result.Add(new StaffHRSummaryDto
                {
                    StaffId = staff.Id,
                    StaffFullName = $"{staff.Name} {staff.Surname}",
                    Position = hr?.Position,
                    HireDate = hr?.HireDate,
                    Salary = hr?.Salary,
                    SalaryCurrency = hr?.SalaryCurrency ?? "TRY",
                    AnnualLeaveEntitlement = hr?.AnnualLeaveEntitlement ?? 14,
                    UsedLeaveDays = hr?.UsedLeaveDays ?? 0,
                    RemainingLeaveDays = (hr?.AnnualLeaveEntitlement ?? 14) - (hr?.UsedLeaveDays ?? 0),
                    Roles = roles.ToList()
                });
            }

            return result;
        }
    }
}
