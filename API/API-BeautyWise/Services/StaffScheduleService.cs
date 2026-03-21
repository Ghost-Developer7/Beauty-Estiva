using API_BeautyWise.DTO;
using API_BeautyWise.Enums;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class StaffScheduleService : IStaffScheduleService
    {
        private readonly Context _context;

        public StaffScheduleService(Context context)
        {
            _context = context;
        }

        public async Task<List<StaffUnavailabilityListDto>> GetUnavailabilitiesAsync(
            int tenantId, int staffId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.StaffUnavailabilities
                .Where(u => u.TenantId == tenantId && u.StaffId == staffId && u.IsActive == true);

            if (startDate.HasValue)
                query = query.Where(u => u.EndTime >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(u => u.StartTime <= endDate.Value);

            return await query
                .OrderBy(u => u.StartTime)
                .Select(u => new StaffUnavailabilityListDto
                {
                    Id            = u.Id,
                    StaffId       = u.StaffId,
                    StaffFullName = $"{u.Staff.Name} {u.Staff.Surname}",
                    StartTime     = u.StartTime,
                    EndTime       = u.EndTime,
                    Reason        = u.Reason,
                    Notes         = u.Notes
                })
                .ToListAsync();
        }

        public async Task<StaffUnavailabilityListDto?> GetUnavailabilityByIdAsync(int id, int tenantId)
        {
            return await _context.StaffUnavailabilities
                .Where(u => u.Id == id && u.TenantId == tenantId && u.IsActive == true)
                .Select(u => new StaffUnavailabilityListDto
                {
                    Id            = u.Id,
                    StaffId       = u.StaffId,
                    StaffFullName = $"{u.Staff.Name} {u.Staff.Surname}",
                    StartTime     = u.StartTime,
                    EndTime       = u.EndTime,
                    Reason        = u.Reason,
                    Notes         = u.Notes
                })
                .FirstOrDefaultAsync();
        }

        public async Task<int> CreateUnavailabilityAsync(
            int tenantId, int staffId, StaffUnavailabilityCreateDto dto)
        {
            if (dto.EndTime <= dto.StartTime)
                throw new Exception("INVALID_TIME|Bitiş zamanı başlangıçtan sonra olmalıdır.");

            // Bu personelin bu aralıkta randevusu var mı?
            var hasAppointment = await _context.Appointments
                .AnyAsync(a => a.StaffId == staffId && a.TenantId == tenantId
                            && a.IsActive == true
                            && a.Status   != AppointmentStatus.Cancelled
                            && a.StartTime < dto.EndTime
                            && a.EndTime   > dto.StartTime);

            if (hasAppointment)
                throw new Exception("HAS_APPOINTMENTS|Bu zaman aralığında personelin mevcut randevuları var. Önce randevuları iptal edin veya farklı bir zaman seçin.");

            var unavailability = new StaffUnavailability
            {
                TenantId  = tenantId,
                StaffId   = staffId,
                StartTime = dto.StartTime,
                EndTime   = dto.EndTime,
                Reason    = dto.Reason,
                Notes     = dto.Notes,
                IsActive  = true,
                CDate     = DateTime.Now
            };

            _context.StaffUnavailabilities.Add(unavailability);
            await _context.SaveChangesAsync();
            return unavailability.Id;
        }

        public async Task<bool> UpdateUnavailabilityAsync(
            int id, int tenantId, int staffId, StaffUnavailabilityUpdateDto dto)
        {
            var unavailability = await _context.StaffUnavailabilities
                .FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId
                                       && u.StaffId == staffId && u.IsActive == true);

            if (unavailability == null)
                throw new Exception("NOT_FOUND|Kayıt bulunamadı.");

            if (dto.EndTime <= dto.StartTime)
                throw new Exception("INVALID_TIME|Bitiş zamanı başlangıçtan sonra olmalıdır.");

            // Randevu çakışması kontrolü (kendisi hariç)
            var hasAppointment = await _context.Appointments
                .AnyAsync(a => a.StaffId == staffId && a.TenantId == tenantId
                            && a.IsActive == true
                            && a.Status   != AppointmentStatus.Cancelled
                            && a.StartTime < dto.EndTime
                            && a.EndTime   > dto.StartTime);

            if (hasAppointment)
                throw new Exception("HAS_APPOINTMENTS|Bu zaman aralığında personelin mevcut randevuları var.");

            unavailability.StartTime = dto.StartTime;
            unavailability.EndTime   = dto.EndTime;
            unavailability.Reason    = dto.Reason;
            unavailability.Notes     = dto.Notes;
            unavailability.UDate     = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUnavailabilityAsync(int id, int tenantId, int staffId)
        {
            var unavailability = await _context.StaffUnavailabilities
                .FirstOrDefaultAsync(u => u.Id == id && u.TenantId == tenantId
                                       && u.StaffId == staffId && u.IsActive == true);

            if (unavailability == null)
                throw new Exception("NOT_FOUND|Kayıt bulunamadı.");

            unavailability.IsActive = false;
            unavailability.UDate    = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<StaffDailyScheduleDto> GetDailyScheduleAsync(
            int tenantId, int staffId, DateTime date)
        {
            var staff = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == staffId && u.TenantId == tenantId);

            if (staff == null)
                throw new Exception("NOT_FOUND|Personel bulunamadı.");

            var dayStart = date.Date;
            var dayEnd   = date.Date.AddDays(1);

            var appointments = await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Treatment)
                .Where(a => a.StaffId == staffId && a.TenantId == tenantId
                         && a.IsActive == true
                         && a.StartTime >= dayStart && a.StartTime < dayEnd)
                .OrderBy(a => a.StartTime)
                .Select(a => new AppointmentListDto
                {
                    Id               = a.Id,
                    CustomerId       = a.CustomerId,
                    CustomerFullName = $"{a.Customer.Name} {a.Customer.Surname}",
                    CustomerPhone    = a.Customer.Phone,
                    StaffId          = a.StaffId,
                    StaffFullName    = $"{staff.Name} {staff.Surname}",
                    TreatmentId      = a.TreatmentId,
                    TreatmentName    = a.Treatment.Name,
                    TreatmentColor   = a.Treatment.Color,
                    DurationMinutes  = a.Treatment.DurationMinutes,
                    StartTime        = a.StartTime,
                    EndTime          = a.EndTime,
                    Status           = a.Status.ToString(),
                    Notes            = a.Notes,
                    IsRecurring      = a.IsRecurring,
                    SessionNumber    = a.SessionNumber,
                    TotalSessions    = a.TotalSessions
                })
                .ToListAsync();

            var unavailabilities = await _context.StaffUnavailabilities
                .Where(u => u.StaffId == staffId && u.TenantId == tenantId
                         && u.IsActive == true
                         && u.StartTime >= dayStart && u.StartTime < dayEnd)
                .OrderBy(u => u.StartTime)
                .Select(u => new StaffUnavailabilityListDto
                {
                    Id            = u.Id,
                    StaffId       = u.StaffId,
                    StaffFullName = $"{staff.Name} {staff.Surname}",
                    StartTime     = u.StartTime,
                    EndTime       = u.EndTime,
                    Reason        = u.Reason,
                    Notes         = u.Notes
                })
                .ToListAsync();

            return new StaffDailyScheduleDto
            {
                StaffId           = staffId,
                StaffFullName     = $"{staff.Name} {staff.Surname}",
                Date              = date.Date,
                Appointments      = appointments,
                UnavailablePeriods = unavailabilities
            };
        }
    }
}
