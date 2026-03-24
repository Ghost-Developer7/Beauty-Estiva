using API_BeautyWise.DTO;
using API_BeautyWise.Enums;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly Context _ctx;

        public DashboardService(Context ctx) => _ctx = ctx;

        public async Task<DashboardSummaryDto> GetSummaryAsync(int tenantId, int? staffId = null)
        {
            var now   = DateTime.Now;
            var today = now.Date;
            var todayEnd = today.AddDays(1).AddTicks(-1);

            // ── Bu haftanın başı (Pazartesi) ve sonu ────────────────────────
            var daysFromMonday = ((int)today.DayOfWeek + 6) % 7;
            var weekStart = today.AddDays(-daysFromMonday);
            var weekEnd   = weekStart.AddDays(7).AddTicks(-1);

            // ── Bu ayın başı ve sonu ────────────────────────────────────────
            var monthStart = new DateTime(now.Year, now.Month, 1);
            var monthEnd   = monthStart.AddMonths(1).AddTicks(-1);

            // ── Son 6 ay range ──────────────────────────────────────────────
            var sixMonthsAgo = new DateTime(now.Year, now.Month, 1).AddMonths(-5);

            var dto = new DashboardSummaryDto();

            // ================================================================
            //  RANDEVU İSTATİSTİKLERİ
            // ================================================================

            var appointmentsQuery = _ctx.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Staff)
                .Include(a => a.Treatment)
                .Where(a => a.TenantId == tenantId && a.IsActive == true);

            if (staffId.HasValue)
                appointmentsQuery = appointmentsQuery.Where(a => a.StaffId == staffId.Value);

            // Bugünün randevuları
            var todayAppointments = await appointmentsQuery
                .Where(a => a.StartTime >= today && a.StartTime <= todayEnd)
                .OrderBy(a => a.StartTime)
                .ToListAsync();

            dto.TodayAppointmentsCount = todayAppointments.Count;
            dto.UpcomingAppointments   = todayAppointments
                .Count(a => a.StartTime > now && a.Status != AppointmentStatus.Cancelled);

            dto.TodaySchedule = todayAppointments.Select(a => new TodayAppointmentDto
            {
                Id             = a.Id,
                Time           = $"{a.StartTime:HH:mm} - {a.EndTime:HH:mm}",
                CustomerName   = $"{a.Customer.Name} {a.Customer.Surname}",
                TreatmentName  = a.Treatment.Name,
                StaffName      = $"{a.Staff.Name} {a.Staff.Surname}",
                Status         = a.Status.ToString(),
                TreatmentColor = a.Treatment.Color
            }).ToList();

            // Randevu durum dağılımı (bu ay)
            var monthAppointments = await appointmentsQuery
                .Where(a => a.StartTime >= monthStart && a.StartTime <= monthEnd)
                .ToListAsync();

            dto.StatusDistribution = new AppointmentStatusDistributionDto
            {
                Scheduled = monthAppointments.Count(a => a.Status == AppointmentStatus.Scheduled),
                Confirmed = monthAppointments.Count(a => a.Status == AppointmentStatus.Confirmed),
                Completed = monthAppointments.Count(a => a.Status == AppointmentStatus.Completed),
                Cancelled = monthAppointments.Count(a => a.Status == AppointmentStatus.Cancelled),
                NoShow    = monthAppointments.Count(a => a.Status == AppointmentStatus.NoShow),
                Total     = monthAppointments.Count
            };

            // ================================================================
            //  GELİR İSTATİSTİKLERİ
            // ================================================================

            var paymentsQuery = _ctx.AppointmentPayments
                .Include(p => p.Appointment).ThenInclude(a => a.Treatment)
                .Include(p => p.Appointment).ThenInclude(a => a.Staff)
                .Where(p => p.TenantId == tenantId && p.IsActive == true);

            if (staffId.HasValue)
                paymentsQuery = paymentsQuery.Where(p => p.Appointment.StaffId == staffId.Value);

            // Bu hafta gelir
            var weekPayments = await paymentsQuery
                .Where(p => p.PaidAt >= weekStart && p.PaidAt <= weekEnd)
                .ToListAsync();
            dto.ThisWeekRevenue = weekPayments.Sum(p => p.AmountInTry);

            // Bu ay gelir
            var monthPayments = await paymentsQuery
                .Where(p => p.PaidAt >= monthStart && p.PaidAt <= monthEnd)
                .ToListAsync();
            dto.ThisMonthRevenue = monthPayments.Sum(p => p.AmountInTry);

            // Top 5 hizmet (bu ay gelire göre)
            dto.TopServices = monthPayments
                .GroupBy(p => p.Appointment.Treatment.Name)
                .Select(g => new RevenueByGroupDto
                {
                    Label       = g.Key,
                    Count       = g.Count(),
                    AmountInTry = g.Sum(p => p.AmountInTry)
                })
                .OrderByDescending(x => x.AmountInTry)
                .Take(5)
                .ToList();

            // Top 5 personel (bu ay gelire göre) — sadece admin/owner (staffId null ise)
            if (!staffId.HasValue)
            {
                dto.TopStaff = monthPayments
                    .GroupBy(p => $"{p.Appointment.Staff.Name} {p.Appointment.Staff.Surname}")
                    .Select(g => new RevenueByGroupDto
                    {
                        Label       = g.Key,
                        Count       = g.Count(),
                        AmountInTry = g.Sum(p => p.AmountInTry)
                    })
                    .OrderByDescending(x => x.AmountInTry)
                    .Take(5)
                    .ToList();
            }

            // ================================================================
            //  GİDER İSTATİSTİKLERİ (sadece Owner/Admin — staffId null)
            // ================================================================

            if (!staffId.HasValue)
            {
                var monthExpenses = await _ctx.Expenses
                    .Where(e => e.TenantId == tenantId && e.IsActive == true
                             && e.ExpenseDate >= monthStart && e.ExpenseDate <= monthEnd)
                    .ToListAsync();
                dto.ThisMonthExpense = monthExpenses.Sum(e => e.AmountInTry);
            }

            // ================================================================
            //  AYLIK TREND (son 6 ay)
            // ================================================================

            // Gelir trendi
            var trendPayments = await paymentsQuery
                .Where(p => p.PaidAt >= sixMonthsAgo)
                .Select(p => new { p.PaidAt, p.AmountInTry })
                .ToListAsync();

            var revenueByMonth = trendPayments
                .GroupBy(p => $"{p.PaidAt.Year}-{p.PaidAt.Month:D2}")
                .ToDictionary(g => g.Key, g => g.Sum(p => p.AmountInTry));

            // Gider trendi
            var expenseByMonth = new Dictionary<string, decimal>();
            if (!staffId.HasValue)
            {
                var trendExpenses = await _ctx.Expenses
                    .Where(e => e.TenantId == tenantId && e.IsActive == true
                             && e.ExpenseDate >= sixMonthsAgo)
                    .Select(e => new { e.ExpenseDate, e.AmountInTry })
                    .ToListAsync();

                expenseByMonth = trendExpenses
                    .GroupBy(e => $"{e.ExpenseDate.Year}-{e.ExpenseDate.Month:D2}")
                    .ToDictionary(g => g.Key, g => g.Sum(e => e.AmountInTry));
            }

            // Son 6 aylık trend dizisi oluştur
            for (int i = 5; i >= 0; i--)
            {
                var date = now.AddMonths(-i);
                var key  = $"{date.Year}-{date.Month:D2}";
                dto.MonthlyTrend.Add(new MonthlyTrendDto
                {
                    Month   = key,
                    Revenue = revenueByMonth.GetValueOrDefault(key, 0),
                    Expense = expenseByMonth.GetValueOrDefault(key, 0)
                });
            }

            // ================================================================
            //  MÜŞTERİ İSTATİSTİKLERİ
            // ================================================================

            var customers = await _ctx.Customers
                .Where(c => c.TenantId == tenantId && c.IsActive == true)
                .Select(c => new { c.Id, c.CDate })
                .ToListAsync();

            dto.TotalCustomers = customers.Count;

            // Müşteri büyümesi (son 6 ay)
            for (int i = 5; i >= 0; i--)
            {
                var date       = now.AddMonths(-i);
                var key        = $"{date.Year}-{date.Month:D2}";
                var cutoffEnd  = new DateTime(date.Year, date.Month, 1).AddMonths(1).AddTicks(-1);
                var cutoffStart = new DateTime(date.Year, date.Month, 1);

                dto.CustomerGrowth.Add(new CustomerGrowthDto
                {
                    Month          = key,
                    NewCustomers   = customers.Count(c => c.CDate.HasValue
                                         && c.CDate.Value >= cutoffStart
                                         && c.CDate.Value <= cutoffEnd),
                    TotalCustomers = customers.Count(c => !c.CDate.HasValue || c.CDate.Value <= cutoffEnd)
                });
            }

            // ================================================================
            //  AKTİF PAKETLER
            // ================================================================

            dto.ActivePackages = await _ctx.PackageSales
                .CountAsync(ps => ps.TenantId == tenantId
                              && ps.IsActive == true
                              && ps.Status == PackageSaleStatus.Active);

            return dto;
        }
    }
}
