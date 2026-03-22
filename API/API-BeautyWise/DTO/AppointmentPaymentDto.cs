using System.ComponentModel.DataAnnotations;
using API_BeautyWise.Enums;

namespace API_BeautyWise.DTO
{
    public class AppointmentPaymentCreateDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Randevu seçimi gereklidir.")]
        public int           AppointmentId     { get; set; }

        [Range(0.01, 99999999.99, ErrorMessage = "Tutar geçerli bir değer olmalıdır.")]
        public decimal       Amount            { get; set; }

        public int           CurrencyId        { get; set; } = 1;
        public decimal       ExchangeRateToTry { get; set; } = 1m;
        public PaymentMethod PaymentMethod     { get; set; } = PaymentMethod.Cash;
        public DateTime?     PaidAt            { get; set; }

        [StringLength(1000)]
        public string?       Notes             { get; set; }
    }

    public class AppointmentPaymentUpdateDto
    {
        [Range(0.01, 99999999.99, ErrorMessage = "Tutar geçerli bir değer olmalıdır.")]
        public decimal       Amount            { get; set; }

        public int           CurrencyId        { get; set; }
        public decimal       ExchangeRateToTry { get; set; } = 1m;
        public PaymentMethod PaymentMethod     { get; set; }
        public DateTime?     PaidAt            { get; set; }

        [StringLength(1000)]
        public string?       Notes             { get; set; }
    }

    public class AppointmentPaymentListDto
    {
        public int      Id                   { get; set; }
        public int      AppointmentId        { get; set; }
        public string   CustomerFullName     { get; set; } = null!;
        public string   TreatmentName        { get; set; } = null!;
        public string   StaffFullName        { get; set; } = null!;
        public DateTime AppointmentStartTime { get; set; }
        public decimal  Amount               { get; set; }
        public string   CurrencyCode         { get; set; } = null!;
        public string   CurrencySymbol       { get; set; } = null!;
        public decimal  ExchangeRateToTry    { get; set; }
        public decimal  AmountInTry          { get; set; }
        public int      PaymentMethodValue   { get; set; }
        public string   PaymentMethodDisplay { get; set; } = null!;
        public DateTime PaidAt               { get; set; }
        public string?  Notes                { get; set; }
    }
}
