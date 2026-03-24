namespace API_BeautyWise.DTO
{
    // ─── Dashboard Summary ─────────────────────────────────────────────────

    /// <summary>Ana dashboard endpoint'inin d&ouml;nd&uuml;rd&uuml;&gbreve;&uuml; t&uuml;m veri</summary>
    public class DashboardSummaryDto
    {
        // Genel istatistikler
        public int    TodayAppointmentsCount { get; set; }
        public int    UpcomingAppointments   { get; set; }
        public decimal ThisWeekRevenue       { get; set; }
        public decimal ThisMonthRevenue      { get; set; }
        public decimal ThisMonthExpense      { get; set; }
        public int    TotalCustomers         { get; set; }
        public int    ActivePackages         { get; set; }

        // Ayl&imath;k gelir/gider trendi (son 6 ay)
        public List<MonthlyTrendDto> MonthlyTrend { get; set; } = new();

        // En iyi 5 hizmet (gelire g&ouml;re)
        public List<RevenueByGroupDto> TopServices { get; set; } = new();

        // En iyi 5 personel (gelire g&ouml;re)
        public List<RevenueByGroupDto> TopStaff { get; set; } = new();

        // M&uuml;steri b&uuml;y&uuml;mesi (son 6 ay)
        public List<CustomerGrowthDto> CustomerGrowth { get; set; } = new();

        // Randevu durum da&gbreve;&imath;l&imath;m&imath;
        public AppointmentStatusDistributionDto StatusDistribution { get; set; } = new();

        // Bug&uuml;n&uuml;n randevular&imath; (mini tablo)
        public List<TodayAppointmentDto> TodaySchedule { get; set; } = new();
    }

    /// <summary>Ayl&imath;k gelir/gider trendi</summary>
    public class MonthlyTrendDto
    {
        public string  Month   { get; set; } = null!;   // "2024-01" formatında
        public decimal Revenue { get; set; }
        public decimal Expense { get; set; }
    }

    /// <summary>M&uuml;steri b&uuml;y&uuml;mesi</summary>
    public class CustomerGrowthDto
    {
        public string Month          { get; set; } = null!;
        public int    NewCustomers   { get; set; }
        public int    TotalCustomers { get; set; }
    }

    /// <summary>Randevu durum da&gbreve;&imath;l&imath;m&imath;</summary>
    public class AppointmentStatusDistributionDto
    {
        public int Scheduled { get; set; }
        public int Confirmed { get; set; }
        public int Completed { get; set; }
        public int Cancelled { get; set; }
        public int NoShow    { get; set; }
        public int Total     { get; set; }
    }

    /// <summary>Bug&uuml;n&uuml;n randevular&imath; (mini tablo)</summary>
    public class TodayAppointmentDto
    {
        public int      Id               { get; set; }
        public string   Time             { get; set; } = null!;  // "09:00 - 10:00"
        public string   CustomerName     { get; set; } = null!;
        public string   TreatmentName    { get; set; } = null!;
        public string   StaffName        { get; set; } = null!;
        public string   Status           { get; set; } = null!;
        public string?  TreatmentColor   { get; set; }
    }
}
