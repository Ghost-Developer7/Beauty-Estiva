using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class StaffLeaveService : IStaffLeaveService
    {
        private readonly Context _context;

        public StaffLeaveService(Context context)
        {
            _context = context;
        }

        public async Task<List<StaffLeaveListDto>> GetLeavesAsync(
            int tenantId, int? staffId = null, string? status = null, int? month = null, int? year = null)
        {
            var query = _context.StaffLeaves
                .Where(l => l.TenantId == tenantId && l.IsActive == true);

            if (staffId.HasValue)
                query = query.Where(l => l.StaffId == staffId.Value);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(l => l.Status == status);

            if (year.HasValue)
                query = query.Where(l => l.StartDate.Year == year.Value || l.EndDate.Year == year.Value);

            if (month.HasValue)
                query = query.Where(l => l.StartDate.Month == month.Value || l.EndDate.Month == month.Value);

            return await query
                .OrderByDescending(l => l.StartDate)
                .Select(l => new StaffLeaveListDto
                {
                    Id = l.Id,
                    StaffId = l.StaffId,
                    StaffFullName = $"{l.Staff.Name} {l.Staff.Surname}",
                    StartDate = l.StartDate,
                    EndDate = l.EndDate,
                    DurationDays = (int)(l.EndDate.Date - l.StartDate.Date).TotalDays + 1,
                    LeaveType = l.LeaveType,
                    Reason = l.Reason,
                    Status = l.Status,
                    ApprovedById = l.ApprovedById,
                    ApprovedByName = l.ApprovedBy != null ? $"{l.ApprovedBy.Name} {l.ApprovedBy.Surname}" : null,
                    ApprovedDate = l.ApprovedDate
                })
                .ToListAsync();
        }

        public async Task<int> CreateLeaveAsync(int tenantId, int requesterId, StaffLeaveCreateDto dto, bool isOwnerOrAdmin)
        {
            int targetStaffId = dto.StaffId.HasValue && isOwnerOrAdmin ? dto.StaffId.Value : requesterId;

            if (dto.EndDate.Date < dto.StartDate.Date)
                throw new Exception("INVALID_DATE|Bitis tarihi baslangictan sonra olmalidir.");

            var validTypes = new[] { "Annual", "Sick", "Maternity", "Unpaid", "Other" };
            if (!validTypes.Contains(dto.LeaveType))
                throw new Exception("INVALID_TYPE|Gecersiz izin turu.");

            // Cakisma kontrolu
            var hasOverlap = await _context.StaffLeaves
                .AnyAsync(l => l.TenantId == tenantId
                            && l.StaffId == targetStaffId
                            && l.IsActive == true
                            && l.Status != "Rejected"
                            && l.StartDate.Date <= dto.EndDate.Date
                            && l.EndDate.Date >= dto.StartDate.Date);

            if (hasOverlap)
                throw new Exception("OVERLAP|Bu tarihler arasinda zaten bir izin talebi mevcut.");

            var leave = new StaffLeave
            {
                TenantId = tenantId,
                StaffId = targetStaffId,
                StartDate = dto.StartDate.Date,
                EndDate = dto.EndDate.Date,
                LeaveType = dto.LeaveType,
                Reason = dto.Reason,
                Status = "Pending",
                IsActive = true,
                CDate = DateTime.Now
            };

            _context.StaffLeaves.Add(leave);
            await _context.SaveChangesAsync();
            return leave.Id;
        }

        public async Task ApproveLeaveAsync(int tenantId, int leaveId, int approvedById)
        {
            var leave = await _context.StaffLeaves
                .FirstOrDefaultAsync(l => l.Id == leaveId && l.TenantId == tenantId && l.IsActive == true);

            if (leave == null)
                throw new Exception("NOT_FOUND|Izin talebi bulunamadi.");

            if (leave.Status != "Pending")
                throw new Exception("INVALID_STATUS|Bu izin talebi zaten islenmis.");

            leave.Status = "Approved";
            leave.ApprovedById = approvedById;
            leave.ApprovedDate = DateTime.Now;
            leave.UDate = DateTime.Now;

            // HR bilgisindeki kullanilan izin gunlerini guncelle
            var durationDays = (int)(leave.EndDate.Date - leave.StartDate.Date).TotalDays + 1;
            var hrInfo = await _context.StaffHRInfos
                .FirstOrDefaultAsync(h => h.TenantId == tenantId && h.StaffId == leave.StaffId && h.IsActive == true);

            if (hrInfo != null)
            {
                hrInfo.UsedLeaveDays += durationDays;
                hrInfo.UDate = DateTime.Now;
            }

            await _context.SaveChangesAsync();
        }

        public async Task RejectLeaveAsync(int tenantId, int leaveId, int rejectedById)
        {
            var leave = await _context.StaffLeaves
                .FirstOrDefaultAsync(l => l.Id == leaveId && l.TenantId == tenantId && l.IsActive == true);

            if (leave == null)
                throw new Exception("NOT_FOUND|Izin talebi bulunamadi.");

            if (leave.Status != "Pending")
                throw new Exception("INVALID_STATUS|Bu izin talebi zaten islenmis.");

            leave.Status = "Rejected";
            leave.ApprovedById = rejectedById;
            leave.ApprovedDate = DateTime.Now;
            leave.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteLeaveAsync(int tenantId, int leaveId, int requesterId, bool isOwnerOrAdmin)
        {
            var leave = await _context.StaffLeaves
                .FirstOrDefaultAsync(l => l.Id == leaveId && l.TenantId == tenantId && l.IsActive == true);

            if (leave == null)
                throw new Exception("NOT_FOUND|Izin talebi bulunamadi.");

            // Sadece kendi talebini veya Owner/Admin tum talepleri silebilir
            if (!isOwnerOrAdmin && leave.StaffId != requesterId)
                throw new Exception("FORBIDDEN|Bu islemi yapmaya yetkiniz yok.");

            // Onaylanan izinler silinirse kullanilan gun sayisini geri al
            if (leave.Status == "Approved")
            {
                var durationDays = (int)(leave.EndDate.Date - leave.StartDate.Date).TotalDays + 1;
                var hrInfo = await _context.StaffHRInfos
                    .FirstOrDefaultAsync(h => h.TenantId == tenantId && h.StaffId == leave.StaffId && h.IsActive == true);

                if (hrInfo != null)
                {
                    hrInfo.UsedLeaveDays = Math.Max(0, hrInfo.UsedLeaveDays - durationDays);
                    hrInfo.UDate = DateTime.Now;
                }
            }

            leave.IsActive = false;
            leave.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        public async Task<List<StaffLeaveBalanceDto>> GetLeaveBalancesAsync(int tenantId)
        {
            var staffMembers = await _context.Users
                .Where(u => u.TenantId == tenantId && u.IsActive == true)
                .OrderBy(u => u.Name).ThenBy(u => u.Surname)
                .Select(u => new { u.Id, FullName = $"{u.Name} {u.Surname}" })
                .ToListAsync();

            var hrInfos = await _context.StaffHRInfos
                .Where(h => h.TenantId == tenantId && h.IsActive == true)
                .ToListAsync();

            var pendingLeaves = await _context.StaffLeaves
                .Where(l => l.TenantId == tenantId && l.IsActive == true && l.Status == "Pending")
                .ToListAsync();

            var result = new List<StaffLeaveBalanceDto>();

            foreach (var staff in staffMembers)
            {
                var hr = hrInfos.FirstOrDefault(h => h.StaffId == staff.Id);
                var entitlement = hr?.AnnualLeaveEntitlement ?? 14;
                var used = hr?.UsedLeaveDays ?? 0;

                var pendingDays = pendingLeaves
                    .Where(l => l.StaffId == staff.Id)
                    .Sum(l => (int)(l.EndDate.Date - l.StartDate.Date).TotalDays + 1);

                result.Add(new StaffLeaveBalanceDto
                {
                    StaffId = staff.Id,
                    StaffFullName = staff.FullName,
                    AnnualEntitlement = entitlement,
                    UsedDays = used,
                    PendingDays = pendingDays,
                    RemainingDays = entitlement - used
                });
            }

            return result;
        }
    }
}
