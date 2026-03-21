using API_BeautyWise.DTO;
using API_BeautyWise.Enums;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class FinancialReportService : IFinancialReportService
    {
        private readonly Context _ctx;

        public FinancialReportService(Context ctx) => _ctx = ctx;

        // ════════════════════════════════════════════════════════════════════════
        //  GELİR ÖZETİ
        // ════════════════════════════════════════════════════════════════════════

        public async Task<RevenueSummaryDto> GetRevenueSummaryAsync(
            int tenantId, DateTime startDate, DateTime endDate, int? staffId = null)
        {
            var start = startDate.Date;
            var end   = endDate.Date.AddDays(1).AddTicks(-1);

            var paymentsQuery = _ctx.AppointmentPayments
                .Include(p => p.Currency)
                .Include(p => p.Appointment).ThenInclude(a => a.Staff)
                .Include(p => p.Appointment).ThenInclude(a => a.Treatment)
                .Where(p => p.TenantId == tenantId
                         && p.IsActive == true
                         && p.PaidAt >= start
                         && p.PaidAt <= end);

            if (staffId.HasValue)
                paymentsQuery = paymentsQuery.Where(p => p.Appointment.StaffId == staffId.Value);

            var payments = await paymentsQuery.ToListAsync();

            var result = new RevenueSummaryDto
            {
                StartDate        = startDate,
                EndDate          = endDate,
                TotalAmountInTry = payments.Sum(p => p.AmountInTry),
                PaymentCount     = payments.Count,
                AppointmentCount = payments.Select(p => p.AppointmentId).Distinct().Count()
            };

            // Ödeme yöntemi bazlı
            result.ByPaymentMethod = payments
                .GroupBy(p => p.PaymentMethod)
                .Select(g => new RevenueByGroupDto
                {
                    Label       = PaymentMethodDisplay(g.Key),
                    Count       = g.Count(),
                    AmountInTry = g.Sum(p => p.AmountInTry)
                })
                .OrderByDescending(x => x.AmountInTry)
                .ToList();

            // Para birimi bazlı
            result.ByCurrency = payments
                .GroupBy(p => p.Currency.Code)
                .Select(g => new RevenueByGroupDto
                {
                    Label       = g.Key,
                    Count       = g.Count(),
                    AmountInTry = g.Sum(p => p.AmountInTry)
                })
                .OrderByDescending(x => x.AmountInTry)
                .ToList();

            // Hizmet bazlı
            result.ByTreatment = payments
                .GroupBy(p => p.Appointment.Treatment.Name)
                .Select(g => new RevenueByGroupDto
                {
                    Label       = g.Key,
                    Count       = g.Count(),
                    AmountInTry = g.Sum(p => p.AmountInTry)
                })
                .OrderByDescending(x => x.AmountInTry)
                .ToList();

            // Personel bazlı (sadece staffId filtresi yoksa)
            if (!staffId.HasValue)
            {
                result.ByStaff = payments
                    .GroupBy(p => $"{p.Appointment.Staff.Name} {p.Appointment.Staff.Surname}")
                    .Select(g => new RevenueByGroupDto
                    {
                        Label       = g.Key,
                        Count       = g.Count(),
                        AmountInTry = g.Sum(p => p.AmountInTry)
                    })
                    .OrderByDescending(x => x.AmountInTry)
                    .ToList();
            }

            // Günlük kırılım (grafik)
            result.DailyBreakdown = payments
                .GroupBy(p => p.PaidAt.Date)
                .Select(g => new DailyAmountDto
                {
                    Date        = g.Key,
                    AmountInTry = g.Sum(p => p.AmountInTry)
                })
                .OrderBy(x => x.Date)
                .ToList();

            return result;
        }

        // ════════════════════════════════════════════════════════════════════════
        //  GİDER ÖZETİ
        // ════════════════════════════════════════════════════════════════════════

        public async Task<ExpenseSummaryDto> GetExpenseSummaryAsync(
            int tenantId, DateTime startDate, DateTime endDate)
        {
            var start = startDate.Date;
            var end   = endDate.Date.AddDays(1).AddTicks(-1);

            var expenses = await _ctx.Expenses
                .Include(e => e.ExpenseCategory)
                .Where(e => e.TenantId == tenantId
                         && e.IsActive == true
                         && e.ExpenseDate >= start
                         && e.ExpenseDate <= end)
                .ToListAsync();

            var result = new ExpenseSummaryDto
            {
                StartDate        = startDate,
                EndDate          = endDate,
                TotalAmountInTry = expenses.Sum(e => e.AmountInTry),
                ExpenseCount     = expenses.Count
            };

            result.ByCategory = expenses
                .GroupBy(e => e.ExpenseCategory?.Name ?? "Kategorisiz")
                .Select(g => new RevenueByGroupDto
                {
                    Label       = g.Key,
                    Count       = g.Count(),
                    AmountInTry = g.Sum(e => e.AmountInTry)
                })
                .OrderByDescending(x => x.AmountInTry)
                .ToList();

            result.DailyBreakdown = expenses
                .GroupBy(e => e.ExpenseDate.Date)
                .Select(g => new DailyAmountDto
                {
                    Date        = g.Key,
                    AmountInTry = g.Sum(e => e.AmountInTry)
                })
                .OrderBy(x => x.Date)
                .ToList();

            return result;
        }

        // ════════════════════════════════════════════════════════════════════════
        //  FİNANSAL DASHBOARD
        // ════════════════════════════════════════════════════════════════════════

        public async Task<FinancialDashboardDto> GetDashboardAsync(
            int tenantId, DateTime startDate, DateTime endDate, int? staffId = null)
        {
            var start = startDate.Date;
            var end   = endDate.Date.AddDays(1).AddTicks(-1);

            // Gelirler
            var revenue = await GetRevenueSummaryAsync(tenantId, startDate, endDate, staffId);

            // Giderler (sadece Owner/Admin erişir; staffId null ise hesapla)
            decimal totalExpense = 0;
            List<RevenueByGroupDto> topExpenseCategories = new();
            List<DailyAmountDto>    dailyExpense         = new();

            if (!staffId.HasValue)
            {
                var expSummary = await GetExpenseSummaryAsync(tenantId, startDate, endDate);
                totalExpense         = expSummary.TotalAmountInTry;
                topExpenseCategories = expSummary.ByCategory.Take(5).ToList();
                dailyExpense         = expSummary.DailyBreakdown;
            }

            // Randevu istatistikleri
            var appointmentsQuery = _ctx.Appointments
                .Where(a => a.TenantId == tenantId
                         && a.IsActive == true
                         && a.StartTime >= start
                         && a.StartTime <= end);

            if (staffId.HasValue)
                appointmentsQuery = appointmentsQuery.Where(a => a.StaffId == staffId.Value);

            var totalAppointments = await appointmentsQuery.CountAsync();

            var paidAppointmentIds = await _ctx.AppointmentPayments
                .Where(p => p.TenantId == tenantId && p.IsActive == true
                         && p.PaidAt >= start && p.PaidAt <= end)
                .Select(p => p.AppointmentId)
                .Distinct()
                .ToListAsync();

            var paidCount   = paidAppointmentIds.Count;
            var unpaidCount = totalAppointments - paidCount;

            return new FinancialDashboardDto
            {
                StartDate            = startDate,
                EndDate              = endDate,
                TotalRevenueTRY      = revenue.TotalAmountInTry,
                TotalExpenseTRY      = totalExpense,
                NetIncomeTRY         = revenue.TotalAmountInTry - totalExpense,
                TotalAppointments    = totalAppointments,
                PaidAppointments     = paidCount,
                UnpaidAppointments   = unpaidCount < 0 ? 0 : unpaidCount,
                TopTreatments        = revenue.ByTreatment.Take(5).ToList(),
                TopStaff             = revenue.ByStaff.Take(5).ToList(),
                PaymentMethods       = revenue.ByPaymentMethod,
                TopExpenseCategories = topExpenseCategories,
                DailyRevenue         = revenue.DailyBreakdown,
                DailyExpense         = dailyExpense
            };
        }

        // ─── Yardımcı ─────────────────────────────────────────────────────────────

        private static string PaymentMethodDisplay(PaymentMethod method) => method switch
        {
            PaymentMethod.Cash         => "Nakit",
            PaymentMethod.CreditCard   => "Kredi / Banka Kartı",
            PaymentMethod.BankTransfer => "Havale / EFT",
            PaymentMethod.Check        => "Çek",
            _                          => "Diğer"
        };
    }
}
