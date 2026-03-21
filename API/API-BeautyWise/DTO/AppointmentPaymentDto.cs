using API_BeautyWise.Enums;

namespace API_BeautyWise.DTO
{
    /// <summary>
    /// Randevuya ödeme kaydı ekle.
    /// CurrencyId = 1 (TRY) ise ExchangeRateToTry = 1 gönder.
    /// Farklı döviz ise o günkü kuru ExchangeRateToTry alanına gir.
    /// </summary>
    public class AppointmentPaymentCreateDto
    {
        public int           AppointmentId     { get; set; }
        public decimal       Amount            { get; set; }
        public int           CurrencyId        { get; set; } = 1;   // Varsayılan: TRY
        public decimal       ExchangeRateToTry { get; set; } = 1m;
        public PaymentMethod PaymentMethod     { get; set; } = PaymentMethod.Cash;
        public DateTime?     PaidAt            { get; set; }        // null = şu an
        public string?       Notes             { get; set; }
    }

    public class AppointmentPaymentUpdateDto
    {
        public decimal       Amount            { get; set; }
        public int           CurrencyId        { get; set; }
        public decimal       ExchangeRateToTry { get; set; } = 1m;
        public PaymentMethod PaymentMethod     { get; set; }
        public DateTime?     PaidAt            { get; set; }
        public string?       Notes             { get; set; }
    }

    public class AppointmentPaymentListDto
    {
        public int      Id                   { get; set; }
        public int      AppointmentId        { get; set; }

        // Randevu bilgisi (joined)
        public string   CustomerFullName     { get; set; } = null!;
        public string   TreatmentName        { get; set; } = null!;
        public string   StaffFullName        { get; set; } = null!;
        public DateTime AppointmentStartTime { get; set; }

        // Ödeme
        public decimal  Amount               { get; set; }
        public string   CurrencyCode         { get; set; } = null!;
        public string   CurrencySymbol       { get; set; } = null!;
        public decimal  ExchangeRateToTry    { get; set; }
        public decimal  AmountInTry          { get; set; }

        public int      PaymentMethodValue   { get; set; }
        public string   PaymentMethodDisplay { get; set; } = null!;  // "Nakit", "Kredi Kartı" ...
        public DateTime PaidAt               { get; set; }
        public string?  Notes                { get; set; }
    }
}
