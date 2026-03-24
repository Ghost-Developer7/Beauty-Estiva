using API_BeautyWise.DTO;
using API_BeautyWise.Enums;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly Context _context;

        public AppointmentService(Context context)
        {
            _context = context;
        }

        // ================================================================
        //  LİSTELEME
        // ================================================================
        public async Task<List<AppointmentListDto>> GetAllAsync(
            int tenantId, DateTime? startDate = null, DateTime? endDate = null,
            int? staffId = null, int? customerId = null)
        {
            var query = _context.Appointments
                .Where(a => a.TenantId == tenantId && a.IsActive == true);

            if (startDate.HasValue)
                query = query.Where(a => a.StartTime >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(a => a.StartTime <= endDate.Value);
            if (staffId.HasValue)
                query = query.Where(a => a.StaffId == staffId.Value);
            if (customerId.HasValue)
                query = query.Where(a => a.CustomerId == customerId.Value);

            return await query
                .OrderBy(a => a.StartTime)
                .Select(a => MapToListDto(a))
                .ToListAsync();
        }

        public async Task<PaginatedResponse<AppointmentListDto>> GetAllPaginatedAsync(
            int tenantId, int pageNumber, int pageSize,
            DateTime? startDate = null, DateTime? endDate = null,
            int? staffId = null, int? customerId = null)
        {
            var query = _context.Appointments
                .Where(a => a.TenantId == tenantId && a.IsActive == true);

            if (startDate.HasValue)
                query = query.Where(a => a.StartTime >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(a => a.StartTime <= endDate.Value);
            if (staffId.HasValue)
                query = query.Where(a => a.StaffId == staffId.Value);
            if (customerId.HasValue)
                query = query.Where(a => a.CustomerId == customerId.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(a => a.StartTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(a => MapToListDto(a))
                .ToListAsync();

            return new PaginatedResponse<AppointmentListDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<AppointmentDetailDto?> GetByIdAsync(int id, int tenantId)
        {
            var a = await _context.Appointments
                .Include(x => x.Customer)
                .Include(x => x.Staff)
                .Include(x => x.Treatment)
                .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId && x.IsActive == true);

            if (a == null) return null;

            var detail = new AppointmentDetailDto
            {
                Id                   = a.Id,
                CustomerId           = a.CustomerId,
                CustomerFullName     = $"{a.Customer.Name} {a.Customer.Surname}",
                CustomerPhone        = a.Customer.Phone,
                StaffId              = a.StaffId,
                StaffFullName        = $"{a.Staff.Name} {a.Staff.Surname}",
                TreatmentId          = a.TreatmentId,
                TreatmentName        = a.Treatment.Name,
                TreatmentColor       = a.Treatment.Color,
                DurationMinutes      = a.Treatment.DurationMinutes,
                StartTime            = a.StartTime,
                EndTime              = a.EndTime,
                Status               = a.Status.ToString(),
                Notes                = a.Notes,
                IsRecurring          = a.IsRecurring,
                SessionNumber        = a.SessionNumber,
                TotalSessions        = a.TotalSessions,
                ParentAppointmentId  = a.ParentAppointmentId,
                RecurrenceIntervalDays = a.RecurrenceIntervalDays
            };

            // Serinin tüm randevularını getir
            if (a.IsRecurring)
            {
                var parentId = a.ParentAppointmentId ?? a.Id;
                detail.SeriesAppointments = await _context.Appointments
                    .Include(x => x.Customer)
                    .Include(x => x.Staff)
                    .Include(x => x.Treatment)
                    .Where(x => x.TenantId == tenantId && x.IsActive == true
                             && (x.Id == parentId || x.ParentAppointmentId == parentId))
                    .OrderBy(x => x.StartTime)
                    .Select(x => MapToListDto(x))
                    .ToListAsync();
            }

            return detail;
        }

        // ================================================================
        //  OLUŞTURMA (+ Tekrarlayan seans zinciri)
        // ================================================================
        public async Task<List<AppointmentListDto>> CreateAsync(
            int tenantId, int createdByUserId, AppointmentCreateDto dto)
        {
            // Treatment'ı al (süre hesabı için)
            var treatment = await _context.Treatments
                .FirstOrDefaultAsync(t => t.Id == dto.TreatmentId && t.TenantId == tenantId && t.IsActive == true);
            if (treatment == null)
                throw new Exception("NOT_FOUND|Hizmet bulunamadı.");

            // Müşteri var mı?
            var customerExists = await _context.Customers
                .AnyAsync(c => c.Id == dto.CustomerId && c.TenantId == tenantId && c.IsActive == true);
            if (!customerExists)
                throw new Exception("NOT_FOUND|Müşteri bulunamadı.");

            // Personel bu tenant'a ait mi?
            var staffExists = await _context.Users
                .AnyAsync(u => u.Id == dto.StaffId && u.TenantId == tenantId);
            if (!staffExists)
                throw new Exception("NOT_FOUND|Personel bulunamadı.");

            // Tekrarlayan seans doğrulama
            int totalSessions = 1;
            if (dto.IsRecurring)
            {
                if (!dto.RecurrenceIntervalDays.HasValue || dto.RecurrenceIntervalDays <= 0)
                    throw new Exception("INVALID_RECURRENCE|Tekrarlayan randevu için gün aralığı girilmelidir.");
                if (!dto.TotalSessions.HasValue || dto.TotalSessions <= 0)
                    throw new Exception("INVALID_RECURRENCE|Tekrarlayan randevu için toplam seans sayısı girilmelidir.");
                totalSessions = dto.TotalSessions.Value;
            }

            var createdAppointments = new List<Appointment>();
            int? parentId = null;

            for (int session = 1; session <= totalSessions; session++)
            {
                var startTime = dto.StartTime.AddDays(session == 1 ? 0 : (dto.RecurrenceIntervalDays!.Value * (session - 1)));
                var endTime   = startTime.AddMinutes(treatment.DurationMinutes);

                // Her seans için çakışma kontrolü
                var conflict = await CheckConflictAsync(tenantId, dto.StaffId, startTime, endTime);
                if (conflict.HasConflict)
                {
                    // İlk seans çakışıyorsa hata fırlat
                    if (session == 1)
                        throw new Exception($"CONFLICT|{conflict.ConflictDetail}");

                    // Sonraki seanslar çakışıyorsa o seansı atla, devam et
                    // (Kullanıcı sonradan manuel günceller)
                    continue;
                }

                var appointment = new Appointment
                {
                    TenantId               = tenantId,
                    CustomerId             = dto.CustomerId,
                    StaffId                = dto.StaffId,
                    TreatmentId            = dto.TreatmentId,
                    StartTime              = startTime,
                    EndTime                = endTime,
                    Status                 = AppointmentStatus.Scheduled,
                    Notes                  = dto.Notes,
                    IsRecurring            = dto.IsRecurring,
                    RecurrenceIntervalDays = dto.RecurrenceIntervalDays,
                    TotalSessions          = dto.IsRecurring ? dto.TotalSessions : null,
                    SessionNumber          = session,
                    ParentAppointmentId    = session == 1 ? null : parentId,
                    IsActive               = true,
                    CDate                  = DateTime.Now,
                    CUser                  = createdByUserId
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                // İlk seans oluşturuldu → diğer seanslar için parentId set et
                if (session == 1)
                    parentId = appointment.Id;

                createdAppointments.Add(appointment);
            }

            if (!createdAppointments.Any())
                throw new Exception("CONFLICT|Tüm seans zamanlarında çakışma var. Lütfen farklı bir zaman seçin.");

            // Yeni oluşturulanları dto olarak dön
            return await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Staff)
                .Include(a => a.Treatment)
                .Where(a => createdAppointments.Select(x => x.Id).Contains(a.Id))
                .OrderBy(a => a.StartTime)
                .Select(a => MapToListDto(a))
                .ToListAsync();
        }

        // ================================================================
        //  GÜNCELLEME
        // ================================================================
        public async Task<AppointmentListDto> UpdateAsync(int id, int tenantId, AppointmentUpdateDto dto)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Staff)
                .Include(a => a.Treatment)
                .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId && a.IsActive == true);

            if (appointment == null)
                throw new Exception("NOT_FOUND|Randevu bulunamadı.");

            if (appointment.Status == AppointmentStatus.Cancelled)
                throw new Exception("CANCELLED|İptal edilmiş randevu güncellenemez.");

            // Yeni treatment al
            var treatment = await _context.Treatments
                .FirstOrDefaultAsync(t => t.Id == dto.TreatmentId && t.TenantId == tenantId && t.IsActive == true);
            if (treatment == null)
                throw new Exception("NOT_FOUND|Hizmet bulunamadı.");

            var endTime = dto.StartTime.AddMinutes(treatment.DurationMinutes);

            // Çakışma kontrolü (mevcut randevu hariç)
            var conflict = await CheckConflictAsync(tenantId, dto.StaffId, dto.StartTime, endTime, id);
            if (conflict.HasConflict)
                throw new Exception($"CONFLICT|{conflict.ConflictDetail}");

            appointment.StaffId     = dto.StaffId;
            appointment.TreatmentId = dto.TreatmentId;
            appointment.StartTime   = dto.StartTime;
            appointment.EndTime     = endTime;
            appointment.Notes       = dto.Notes;
            appointment.Status      = dto.Status;
            appointment.UDate       = DateTime.Now;

            await _context.SaveChangesAsync();

            // Güncel veriyi tekrar çek
            return await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Staff)
                .Include(a => a.Treatment)
                .Where(a => a.Id == id)
                .Select(a => MapToListDto(a))
                .FirstAsync();
        }

        // ================================================================
        //  DURUM GÜNCELLEME (Tamamlandı, İptal, Gelmedi vb.)
        // ================================================================
        public async Task<bool> UpdateStatusAsync(int id, int tenantId, AppointmentStatusUpdateDto dto)
        {
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId && a.IsActive == true);

            if (appointment == null)
                throw new Exception("NOT_FOUND|Randevu bulunamadı.");

            appointment.Status = dto.Status;
            if (!string.IsNullOrEmpty(dto.Notes))
                appointment.Notes = dto.Notes;
            appointment.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        // ================================================================
        //  İPTAL
        // ================================================================
        public async Task<bool> CancelAsync(int id, int tenantId, string? notes = null)
        {
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId && a.IsActive == true);

            if (appointment == null)
                throw new Exception("NOT_FOUND|Randevu bulunamadı.");

            if (appointment.Status == AppointmentStatus.Cancelled)
                throw new Exception("ALREADY_CANCELLED|Randevu zaten iptal edilmiş.");

            appointment.Status = AppointmentStatus.Cancelled;
            if (!string.IsNullOrEmpty(notes))
                appointment.Notes = notes;
            appointment.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        // ================================================================
        //  ÇAKIŞMA KONTROLÜ
        // ================================================================
        public async Task<AppointmentConflictDto> CheckConflictAsync(
            int tenantId, int staffId, DateTime startTime, DateTime endTime, int? excludeAppointmentId = null)
        {
            // 1. Randevu çakışması
            var conflictingAppointment = await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Treatment)
                .Where(a => a.StaffId     == staffId
                         && a.TenantId   == tenantId
                         && a.IsActive   == true
                         && a.Status     != AppointmentStatus.Cancelled
                         && a.StartTime  < endTime
                         && a.EndTime    > startTime
                         && (excludeAppointmentId == null || a.Id != excludeAppointmentId))
                .FirstOrDefaultAsync();

            if (conflictingAppointment != null)
            {
                return new AppointmentConflictDto
                {
                    HasConflict    = true,
                    ConflictType   = "Appointment",
                    ConflictDetail = $"Bu personelin {conflictingAppointment.StartTime:HH:mm}-{conflictingAppointment.EndTime:HH:mm} saatleri arasında " +
                                     $"'{conflictingAppointment.Customer.Name} {conflictingAppointment.Customer.Surname}' müşterisine ait " +
                                     $"'{conflictingAppointment.Treatment.Name}' randevusu var.",
                    ConflictStart  = conflictingAppointment.StartTime,
                    ConflictEnd    = conflictingAppointment.EndTime
                };
            }

            // 2. Personel müsaitlik dışı çakışması
            var unavailability = await _context.StaffUnavailabilities
                .Where(u => u.StaffId   == staffId
                         && u.TenantId == tenantId
                         && u.IsActive == true
                         && u.StartTime < endTime
                         && u.EndTime   > startTime)
                .FirstOrDefaultAsync();

            if (unavailability != null)
            {
                return new AppointmentConflictDto
                {
                    HasConflict    = true,
                    ConflictType   = "Unavailability",
                    ConflictDetail = $"Bu personel {unavailability.StartTime:HH:mm}-{unavailability.EndTime:HH:mm} saatleri arasında müsait değil. " +
                                     $"Sebep: {unavailability.Reason}",
                    ConflictStart  = unavailability.StartTime,
                    ConflictEnd    = unavailability.EndTime
                };
            }

            return new AppointmentConflictDto { HasConflict = false };
        }

        // ================================================================
        //  PERSONEL MÜSAİTLİK SORGULAMA
        //  Verilen günde seçili hizmet süresi kadar uygun slotları döner.
        // ================================================================
        public async Task<StaffAvailabilityResultDto> GetStaffAvailabilityAsync(
            int tenantId, StaffAvailabilityRequestDto dto)
        {
            var staff = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == dto.StaffId && u.TenantId == tenantId);
            if (staff == null)
                throw new Exception("NOT_FOUND|Personel bulunamadı.");

            var treatment = await _context.Treatments
                .FirstOrDefaultAsync(t => t.Id == dto.TreatmentId && t.TenantId == tenantId && t.IsActive == true);
            if (treatment == null)
                throw new Exception("NOT_FOUND|Hizmet bulunamadı.");

            var dayStart = dto.Date.Date.AddHours(8);   // Çalışma başlangıcı: 08:00
            var dayEnd   = dto.Date.Date.AddHours(20);  // Çalışma bitişi: 20:00

            // O gün dolu aralıkları çek (randevu + müsaitlik dışı)
            var bookedSlots = await _context.Appointments
                .Where(a => a.StaffId == dto.StaffId && a.TenantId == tenantId
                         && a.IsActive == true && a.Status != AppointmentStatus.Cancelled
                         && a.StartTime.Date == dto.Date.Date)
                .Select(a => new TimeSlotDto
                {
                    StartTime   = a.StartTime,
                    EndTime     = a.EndTime,
                    BlockReason = $"Randevu: {a.Treatment.Name}"
                })
                .ToListAsync();

            var unavailableSlots = await _context.StaffUnavailabilities
                .Where(u => u.StaffId == dto.StaffId && u.TenantId == tenantId
                         && u.IsActive == true
                         && u.StartTime.Date == dto.Date.Date)
                .Select(u => new TimeSlotDto
                {
                    StartTime   = u.StartTime,
                    EndTime     = u.EndTime,
                    BlockReason = u.Reason
                })
                .ToListAsync();

            var allBlockedSlots = bookedSlots.Concat(unavailableSlots)
                .OrderBy(s => s.StartTime).ToList();

            // Müsait slotları hesapla (hizmet süresi kadar boşluklar)
            var availableSlots = new List<TimeSlotDto>();
            var slotDuration   = TimeSpan.FromMinutes(treatment.DurationMinutes);
            var current        = dayStart;

            while (current + slotDuration <= dayEnd)
            {
                var slotEnd = current + slotDuration;

                // Bu slot ile çakışan blok var mı?
                var hasConflict = allBlockedSlots.Any(b => b.StartTime < slotEnd && b.EndTime > current);

                if (!hasConflict)
                {
                    availableSlots.Add(new TimeSlotDto
                    {
                        StartTime = current,
                        EndTime   = slotEnd
                    });
                    current += slotDuration; // bir sonraki slot
                }
                else
                {
                    // Bir sonraki blok bittikten itibaren dene
                    var nextFree = allBlockedSlots
                        .Where(b => b.StartTime < slotEnd && b.EndTime > current)
                        .Max(b => b.EndTime);
                    current = nextFree;
                }
            }

            return new StaffAvailabilityResultDto
            {
                StaffId       = dto.StaffId,
                StaffFullName = $"{staff.Name} {staff.Surname}",
                Date          = dto.Date.Date,
                AvailableSlots = availableSlots,
                BlockedSlots   = allBlockedSlots
            };
        }

        // ================================================================
        //  YARDIMCI: Entity → DTO dönüşümü (expression tree uyumlu)
        // ================================================================
        private static AppointmentListDto MapToListDto(Appointment a) => new AppointmentListDto
        {
            Id                  = a.Id,
            CustomerId          = a.CustomerId,
            CustomerFullName    = $"{a.Customer.Name} {a.Customer.Surname}",
            CustomerPhone       = a.Customer.Phone,
            StaffId             = a.StaffId,
            StaffFullName       = $"{a.Staff.Name} {a.Staff.Surname}",
            TreatmentId         = a.TreatmentId,
            TreatmentName       = a.Treatment.Name,
            TreatmentColor      = a.Treatment.Color,
            DurationMinutes     = a.Treatment.DurationMinutes,
            StartTime           = a.StartTime,
            EndTime             = a.EndTime,
            Status              = a.Status.ToString(),
            Notes               = a.Notes,
            IsRecurring         = a.IsRecurring,
            SessionNumber       = a.SessionNumber,
            TotalSessions       = a.TotalSessions,
            ParentAppointmentId = a.ParentAppointmentId
        };
    }
}
