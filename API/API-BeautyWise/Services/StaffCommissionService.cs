using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class StaffCommissionService : IStaffCommissionService
    {
        private readonly Context _ctx;

        public StaffCommissionService(Context ctx)
        {
            _ctx = ctx;
        }

        // ────────────────────────────────────────────────────────────────────
        //  Komisyon Oran Yönetimi
        // ────────────────────────────────────────────────────────────────────

        public async Task<StaffCommissionRateDto> GetStaffCommissionRatesAsync(int tenantId, int staffId)
        {
            var staff = await _ctx.Users.FirstOrDefaultAsync(u => u.Id == staffId && u.TenantId == tenantId)
                ?? throw new Exception("Personel bulunamadı.");

            var treatmentCommissions = await _ctx.StaffTreatmentCommissions
                .Where(c => c.TenantId == tenantId && c.StaffId == staffId && c.IsActive == true)
                .Include(c => c.Treatment)
                .Select(c => new TreatmentCommissionDto
                {
                    TreatmentId = c.TreatmentId,
                    TreatmentName = c.Treatment.Name,
                    CommissionRate = c.CommissionRate
                })
                .ToListAsync();

            return new StaffCommissionRateDto
            {
                StaffId = staff.Id,
                StaffFullName = $"{staff.Name} {staff.Surname}",
                DefaultCommissionRate = staff.DefaultCommissionRate,
                TreatmentCommissions = treatmentCommissions
            };
        }

        public async Task<AllCommissionRatesDto> GetAllCommissionRatesAsync(int tenantId)
        {
            // Tüm aktif personeli getir
            var staffMembers = await _ctx.Users
                .Where(u => u.TenantId == tenantId && u.IsActive == true)
                .ToListAsync();

            // Tüm aktif hizmetleri getir
            var treatments = await _ctx.Treatments
                .Where(t => t.TenantId == tenantId && t.IsActive == true)
                .Select(t => new TreatmentBasicDto { Id = t.Id, Name = t.Name })
                .ToListAsync();

            // Tüm aktif komisyon oranlarını getir
            var allCommissions = await _ctx.StaffTreatmentCommissions
                .Where(c => c.TenantId == tenantId && c.IsActive == true)
                .Include(c => c.Treatment)
                .ToListAsync();

            var staffRates = staffMembers.Select(s => new StaffCommissionRateDto
            {
                StaffId = s.Id,
                StaffFullName = $"{s.Name} {s.Surname}",
                DefaultCommissionRate = s.DefaultCommissionRate,
                TreatmentCommissions = allCommissions
                    .Where(c => c.StaffId == s.Id)
                    .Select(c => new TreatmentCommissionDto
                    {
                        TreatmentId = c.TreatmentId,
                        TreatmentName = c.Treatment.Name,
                        CommissionRate = c.CommissionRate
                    })
                    .ToList()
            }).ToList();

            return new AllCommissionRatesDto
            {
                StaffRates = staffRates,
                Treatments = treatments
            };
        }

        public async Task SetStaffCommissionAsync(int tenantId, int staffId, SetStaffCommissionDto dto, int updatedByUserId)
        {
            var staff = await _ctx.Users.FirstOrDefaultAsync(u => u.Id == staffId && u.TenantId == tenantId)
                ?? throw new Exception("Personel bulunamadı.");

            // Genel oranı güncelle
            staff.DefaultCommissionRate = dto.DefaultCommissionRate;
            staff.UUser = updatedByUserId;
            staff.UDate = DateTime.UtcNow;

            // Hizmet bazlı oranları güncelle
            if (dto.TreatmentRates != null)
            {
                // Mevcut kayıtları deaktive et
                var existing = await _ctx.StaffTreatmentCommissions
                    .Where(c => c.TenantId == tenantId && c.StaffId == staffId && c.IsActive == true)
                    .ToListAsync();

                foreach (var e in existing)
                {
                    e.IsActive = false;
                    e.UUser = updatedByUserId;
                    e.UDate = DateTime.UtcNow;
                }

                // Yeni kayıtlar oluştur
                foreach (var tr in dto.TreatmentRates)
                {
                    _ctx.StaffTreatmentCommissions.Add(new StaffTreatmentCommission
                    {
                        TenantId = tenantId,
                        StaffId = staffId,
                        TreatmentId = tr.TreatmentId,
                        CommissionRate = tr.CommissionRate,
                        IsActive = true,
                        CUser = updatedByUserId,
                        CDate = DateTime.UtcNow
                    });
                }
            }

            await _ctx.SaveChangesAsync();
        }

        // ────────────────────────────────────────────────────────────────────
        //  Komisyon Hesaplama (Ödeme oluşturulduğunda otomatik çağrılır)
        // ────────────────────────────────────────────────────────────────────

        public async Task<StaffCommissionRecord> CalculateAndRecordCommissionAsync(
            int tenantId, AppointmentPayment payment, int staffId, int treatmentId, int createdByUserId)
        {
            // Hizmet bazlı oran var mı?
            var treatmentRate = await _ctx.StaffTreatmentCommissions
                .FirstOrDefaultAsync(c =>
                    c.TenantId == tenantId &&
                    c.StaffId == staffId &&
                    c.TreatmentId == treatmentId &&
                    c.IsActive == true);

            decimal rate;
            if (treatmentRate != null)
            {
                rate = treatmentRate.CommissionRate;
            }
            else
            {
                var staff = await _ctx.Users.FindAsync(staffId);
                rate = staff?.DefaultCommissionRate ?? 0m;
            }

            var commissionAmount = payment.AmountInTry * (rate / 100m);
            var salonShare = payment.AmountInTry - commissionAmount;

            var record = new StaffCommissionRecord
            {
                TenantId = tenantId,
                StaffId = staffId,
                AppointmentPaymentId = payment.Id,
                CommissionRate = rate,
                PaymentAmountInTry = payment.AmountInTry,
                CommissionAmountInTry = Math.Round(commissionAmount, 2),
                SalonShareInTry = Math.Round(salonShare, 2),
                IsPaid = false,
                IsActive = true,
                CUser = createdByUserId,
                CDate = DateTime.UtcNow
            };

            _ctx.StaffCommissionRecords.Add(record);
            await _ctx.SaveChangesAsync();

            return record;
        }

        // ────────────────────────────────────────────────────────────────────
        //  Komisyon Sorgulama
        // ────────────────────────────────────────────────────────────────────

        public async Task<List<StaffCommissionRecordDto>> GetCommissionRecordsAsync(
            int tenantId, DateTime? startDate, DateTime? endDate, int? staffId, bool? isPaid)
        {
            var query = _ctx.StaffCommissionRecords
                .Where(r => r.TenantId == tenantId && r.IsActive == true)
                .Include(r => r.Staff)
                .Include(r => r.AppointmentPayment)
                    .ThenInclude(p => p.Appointment)
                    .ThenInclude(a => a.Customer)
                .Include(r => r.AppointmentPayment)
                    .ThenInclude(p => p.Appointment)
                    .ThenInclude(a => a.Treatment)
                .AsQueryable();

            if (staffId.HasValue)
                query = query.Where(r => r.StaffId == staffId.Value);

            if (startDate.HasValue)
                query = query.Where(r => r.CDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(r => r.CDate <= endDate.Value.AddDays(1));

            if (isPaid.HasValue)
                query = query.Where(r => r.IsPaid == isPaid.Value);

            return await query
                .OrderByDescending(r => r.CDate)
                .Select(r => new StaffCommissionRecordDto
                {
                    Id = r.Id,
                    StaffId = r.StaffId,
                    StaffFullName = r.Staff.Name + " " + r.Staff.Surname,
                    TreatmentName = r.AppointmentPayment.Appointment.Treatment.Name,
                    CustomerFullName = r.AppointmentPayment.Appointment.Customer.Name + " " +
                                       r.AppointmentPayment.Appointment.Customer.Surname,
                    AppointmentDate = r.AppointmentPayment.Appointment.StartTime,
                    PaymentAmountInTry = r.PaymentAmountInTry,
                    CommissionRate = r.CommissionRate,
                    CommissionAmountInTry = r.CommissionAmountInTry,
                    SalonShareInTry = r.SalonShareInTry,
                    IsPaid = r.IsPaid,
                    PaidAt = r.PaidAt
                })
                .ToListAsync();
        }

        public async Task<List<StaffCommissionSummaryDto>> GetCommissionSummaryAsync(
            int tenantId, DateTime? startDate, DateTime? endDate)
        {
            var query = _ctx.StaffCommissionRecords
                .Where(r => r.TenantId == tenantId && r.IsActive == true)
                .Include(r => r.Staff)
                .AsQueryable();

            if (startDate.HasValue)
                query = query.Where(r => r.CDate >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(r => r.CDate <= endDate.Value.AddDays(1));

            return await query
                .GroupBy(r => new { r.StaffId, r.Staff.Name, r.Staff.Surname })
                .Select(g => new StaffCommissionSummaryDto
                {
                    StaffId = g.Key.StaffId,
                    StaffFullName = g.Key.Name + " " + g.Key.Surname,
                    TotalPaymentsInTry = g.Sum(r => r.PaymentAmountInTry),
                    TotalCommissionInTry = g.Sum(r => r.CommissionAmountInTry),
                    TotalSalonShareInTry = g.Sum(r => r.SalonShareInTry),
                    PaidCommissionInTry = g.Where(r => r.IsPaid).Sum(r => r.CommissionAmountInTry),
                    UnpaidCommissionInTry = g.Where(r => !r.IsPaid).Sum(r => r.CommissionAmountInTry),
                    RecordCount = g.Count()
                })
                .ToListAsync();
        }

        public async Task<StaffCommissionSummaryDto?> GetMyCommissionSummaryAsync(
            int tenantId, int staffId, DateTime? startDate, DateTime? endDate)
        {
            var summaries = await GetCommissionSummaryAsync(tenantId, startDate, endDate);
            return summaries.FirstOrDefault(s => s.StaffId == staffId);
        }

        public async Task<StaffCommissionSummaryDto?> GetStaffCommissionHistoryAsync(
            int tenantId, int staffId, DateTime? startDate, DateTime? endDate)
        {
            var summaries = await GetCommissionSummaryAsync(tenantId, startDate, endDate);
            return summaries.FirstOrDefault(s => s.StaffId == staffId);
        }

        // ────────────────────────────────────────────────────────────────────
        //  Ödeme Takibi
        // ────────────────────────────────────────────────────────────────────

        public async Task MarkCommissionsPaidAsync(int tenantId, List<int> commissionRecordIds, int updatedByUserId)
        {
            var records = await _ctx.StaffCommissionRecords
                .Where(r => r.TenantId == tenantId &&
                            commissionRecordIds.Contains(r.Id) &&
                            r.IsActive == true &&
                            !r.IsPaid)
                .ToListAsync();

            foreach (var record in records)
            {
                record.IsPaid = true;
                record.PaidAt = DateTime.UtcNow;
                record.UUser = updatedByUserId;
                record.UDate = DateTime.UtcNow;
            }

            await _ctx.SaveChangesAsync();
        }

        public async Task BulkPayCommissionsAsync(int tenantId, int staffId, int month, int year, int updatedByUserId)
        {
            var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1);

            var records = await _ctx.StaffCommissionRecords
                .Where(r => r.TenantId == tenantId &&
                            r.StaffId == staffId &&
                            r.CDate >= startDate &&
                            r.CDate < endDate &&
                            r.IsActive == true &&
                            !r.IsPaid)
                .ToListAsync();

            foreach (var record in records)
            {
                record.IsPaid = true;
                record.PaidAt = DateTime.UtcNow;
                record.UUser = updatedByUserId;
                record.UDate = DateTime.UtcNow;
            }

            await _ctx.SaveChangesAsync();
        }
    }
}
