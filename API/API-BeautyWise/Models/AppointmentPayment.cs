using API_BeautyWise.Enums;

namespace API_BeautyWise.Models
{
    /// <summary>
    /// Randevu sonrası müşteriden alınan ödeme kaydı.
    /// Bir randevuya birden fazla ödeme kaydı eklenebilir (kısmi ödemeler).
    /// </summary>
    public class AppointmentPayment : BaseEntity
    {
        public int           Id                 { get; set; }
        public int           TenantId           { get; set; }
        public int           AppointmentId      { get; set; }

        public decimal       Amount             { get; set; }               // Ödenen tutar (orijinal para biriminde)
        public int           CurrencyId         { get; set; }               // Hangi para birimi
        public decimal       ExchangeRateToTry  { get; set; } = 1m;        // 1 TRY ise 1, USD ise o günkü kur
        public decimal       AmountInTry        { get; set; }               // Amount * ExchangeRateToTry

        public PaymentMethod PaymentMethod      { get; set; } = PaymentMethod.Cash;
        public DateTime      PaidAt             { get; set; } = DateTime.Now;
        public string?       Notes              { get; set; }

        // Navigation
        public Tenant             Tenant      { get; set; } = null!;
        public Appointment        Appointment { get; set; } = null!;
        public Currency           Currency    { get; set; } = null!;
    }
}
