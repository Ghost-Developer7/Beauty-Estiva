namespace API_BeautyWise.Models
{
    /// <summary>
    /// Global para birimi tablosu (tenant bağımsız, seed data ile dolar).
    /// TRY, USD, EUR, GBP varsayılan olarak gelir.
    /// </summary>
    public class Currency
    {
        public int    Id           { get; set; }
        public string Code         { get; set; } = null!;  // TRY, USD, EUR, GBP
        public string Symbol       { get; set; } = null!;  // ₺, $, €, £
        public string Name         { get; set; } = null!;  // Türk Lirası, US Dollar...
        public bool   IsDefault    { get; set; } = false;  // Sadece TRY = true
        public bool   IsActive     { get; set; } = true;
        public int    DisplayOrder { get; set; } = 0;

        // Navigation
        public ICollection<AppointmentPayment> AppointmentPayments { get; set; } = new List<AppointmentPayment>();
        public ICollection<Expense>            Expenses            { get; set; } = new List<Expense>();
    }
}
