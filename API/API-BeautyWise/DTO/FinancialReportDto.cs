namespace API_BeautyWise.DTO
{
    // ─── Yardımcı ─────────────────────────────────────────────────────────────────

    /// <summary>Grup bazlı özet (ödeme yöntemi, hizmet, personel, kategori)</summary>
    public class RevenueByGroupDto
    {
        public string  Label       { get; set; } = null!;  // "Nakit", "Saç Boyama", "Ayşe Hanım"
        public int     Count       { get; set; }
        public decimal AmountInTry { get; set; }
    }

    /// <summary>Günlük tutar (grafik için)</summary>
    public class DailyAmountDto
    {
        public DateTime Date        { get; set; }
        public decimal  AmountInTry { get; set; }
    }

    // ─── Gelir Özeti ──────────────────────────────────────────────────────────────

    public class RevenueSummaryDto
    {
        public DateTime StartDate       { get; set; }
        public DateTime EndDate         { get; set; }
        public decimal  TotalAmountInTry { get; set; }
        public int      PaymentCount    { get; set; }
        public int      AppointmentCount{ get; set; }

        // Kırılımlar
        public List<RevenueByGroupDto> ByPaymentMethod { get; set; } = new();
        public List<RevenueByGroupDto> ByCurrency      { get; set; } = new();
        public List<RevenueByGroupDto> ByTreatment     { get; set; } = new();

        /// <summary>Owner/Admin'de dolu gelir; Staff için boş liste döner.</summary>
        public List<RevenueByGroupDto> ByStaff         { get; set; } = new();

        public List<DailyAmountDto>    DailyBreakdown  { get; set; } = new();
    }

    // ─── Gider Özeti ──────────────────────────────────────────────────────────────

    public class ExpenseSummaryDto
    {
        public DateTime StartDate        { get; set; }
        public DateTime EndDate          { get; set; }
        public decimal  TotalAmountInTry { get; set; }
        public int      ExpenseCount     { get; set; }

        public List<RevenueByGroupDto> ByCategory     { get; set; } = new();
        public List<DailyAmountDto>    DailyBreakdown { get; set; } = new();
    }

    // ─── Finansal Dashboard ───────────────────────────────────────────────────────

    public class FinancialDashboardDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate   { get; set; }

        // Net Kâr / Zarar
        public decimal TotalRevenueTRY { get; set; }
        public decimal TotalExpenseTRY { get; set; }
        public decimal NetIncomeTRY    { get; set; }   // Revenue - Expense

        // Randevu istatistikleri
        public int TotalAppointments  { get; set; }
        public int PaidAppointments   { get; set; }
        public int UnpaidAppointments { get; set; }

        // Top listeler
        public List<RevenueByGroupDto> TopTreatments         { get; set; } = new();

        /// <summary>Owner/Admin için dolu; Staff için boş.</summary>
        public List<RevenueByGroupDto> TopStaff              { get; set; } = new();

        public List<RevenueByGroupDto> PaymentMethods        { get; set; } = new();
        public List<RevenueByGroupDto> TopExpenseCategories  { get; set; } = new();

        // Günlük grafik verisi
        public List<DailyAmountDto> DailyRevenue  { get; set; } = new();
        public List<DailyAmountDto> DailyExpense  { get; set; } = new();
    }
}
