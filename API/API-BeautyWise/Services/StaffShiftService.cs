using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class StaffShiftService : IStaffShiftService
    {
        private readonly Context _context;

        public StaffShiftService(Context context)
        {
            _context = context;
        }

        public async Task<List<StaffShiftDto>> GetStaffShiftsAsync(int tenantId, int staffId)
        {
            var shifts = await _context.StaffShifts
                .Where(s => s.TenantId == tenantId && s.StaffId == staffId && s.IsActive == true)
                .OrderBy(s => s.DayOfWeek)
                .Select(s => new StaffShiftDto
                {
                    Id = s.Id,
                    StaffId = s.StaffId,
                    StaffFullName = $"{s.Staff.Name} {s.Staff.Surname}",
                    DayOfWeek = s.DayOfWeek,
                    StartTime = s.StartTime.ToString(@"hh\:mm"),
                    EndTime = s.EndTime.ToString(@"hh\:mm"),
                    BreakStartTime = s.BreakStartTime.HasValue ? s.BreakStartTime.Value.ToString(@"hh\:mm") : null,
                    BreakEndTime = s.BreakEndTime.HasValue ? s.BreakEndTime.Value.ToString(@"hh\:mm") : null,
                    IsWorkingDay = s.IsWorkingDay
                })
                .ToListAsync();

            return shifts;
        }

        public async Task<List<StaffWeeklyShiftDto>> GetWeeklyViewAsync(int tenantId)
        {
            var staffMembers = await _context.Users
                .Where(u => u.TenantId == tenantId && u.IsActive == true)
                .OrderBy(u => u.Name).ThenBy(u => u.Surname)
                .Select(u => new { u.Id, FullName = $"{u.Name} {u.Surname}" })
                .ToListAsync();

            var allShifts = await _context.StaffShifts
                .Where(s => s.TenantId == tenantId && s.IsActive == true)
                .ToListAsync();

            var result = new List<StaffWeeklyShiftDto>();

            foreach (var staff in staffMembers)
            {
                var staffShifts = allShifts
                    .Where(s => s.StaffId == staff.Id)
                    .OrderBy(s => s.DayOfWeek)
                    .Select(s => new StaffShiftDto
                    {
                        Id = s.Id,
                        StaffId = s.StaffId,
                        StaffFullName = staff.FullName,
                        DayOfWeek = s.DayOfWeek,
                        StartTime = s.StartTime.ToString(@"hh\:mm"),
                        EndTime = s.EndTime.ToString(@"hh\:mm"),
                        BreakStartTime = s.BreakStartTime?.ToString(@"hh\:mm"),
                        BreakEndTime = s.BreakEndTime?.ToString(@"hh\:mm"),
                        IsWorkingDay = s.IsWorkingDay
                    })
                    .ToList();

                result.Add(new StaffWeeklyShiftDto
                {
                    StaffId = staff.Id,
                    StaffFullName = staff.FullName,
                    Shifts = staffShifts
                });
            }

            return result;
        }

        public async Task BulkUpdateShiftsAsync(int tenantId, int staffId, StaffShiftBulkUpdateDto dto)
        {
            // Mevcut kayitlari sil (soft delete)
            var existingShifts = await _context.StaffShifts
                .Where(s => s.TenantId == tenantId && s.StaffId == staffId && s.IsActive == true)
                .ToListAsync();

            foreach (var shift in existingShifts)
            {
                shift.IsActive = false;
                shift.UDate = DateTime.Now;
            }

            // Yeni kayitlari ekle
            foreach (var shiftDto in dto.Shifts)
            {
                if (!TimeSpan.TryParse(shiftDto.StartTime, out var startTime))
                    startTime = new TimeSpan(9, 0, 0);
                if (!TimeSpan.TryParse(shiftDto.EndTime, out var endTime))
                    endTime = new TimeSpan(18, 0, 0);

                TimeSpan? breakStart = null;
                TimeSpan? breakEnd = null;

                if (!string.IsNullOrEmpty(shiftDto.BreakStartTime) && TimeSpan.TryParse(shiftDto.BreakStartTime, out var bs))
                    breakStart = bs;
                if (!string.IsNullOrEmpty(shiftDto.BreakEndTime) && TimeSpan.TryParse(shiftDto.BreakEndTime, out var be))
                    breakEnd = be;

                _context.StaffShifts.Add(new StaffShift
                {
                    TenantId = tenantId,
                    StaffId = staffId,
                    DayOfWeek = shiftDto.DayOfWeek,
                    StartTime = startTime,
                    EndTime = endTime,
                    BreakStartTime = breakStart,
                    BreakEndTime = breakEnd,
                    IsWorkingDay = shiftDto.IsWorkingDay,
                    IsActive = true,
                    CDate = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();
        }
    }
}
