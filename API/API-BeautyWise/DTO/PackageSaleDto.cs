using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    // ─── PackageSale Create ───

    public class PackageSaleCreateDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Müşteri seçimi zorunludur.")]
        public int CustomerId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Hizmet seçimi zorunludur.")]
        public int TreatmentId { get; set; }

        [Range(1, 999, ErrorMessage = "Seans sayısı en az 1 olmalıdır.")]
        public int TotalSessions { get; set; }

        [Range(0, 9999999.99, ErrorMessage = "Fiyat geçerli bir değer olmalıdır.")]
        public decimal TotalPrice { get; set; }

        [Range(0, 9999999.99, ErrorMessage = "Ödenen tutar geçerli bir değer olmalıdır.")]
        public decimal PaidAmount { get; set; }

        public API_BeautyWise.Enums.PaymentMethod PaymentMethod { get; set; } = API_BeautyWise.Enums.PaymentMethod.Cash;

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }
    }

    // ─── PackageSale Update ───

    public class PackageSaleUpdateDto
    {
        [Range(1, 999, ErrorMessage = "Seans sayısı en az 1 olmalıdır.")]
        public int TotalSessions { get; set; }

        [Range(0, 9999999.99)]
        public decimal TotalPrice { get; set; }

        public DateTime? EndDate { get; set; }

        public API_BeautyWise.Enums.PackageSaleStatus? Status { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }
    }

    // ─── PackageSale List ───

    public class PackageSaleListDto
    {
        public int      Id                  { get; set; }
        public int      CustomerId          { get; set; }
        public string   CustomerFullName    { get; set; } = "";
        public int      TreatmentId         { get; set; }
        public string   TreatmentName       { get; set; } = "";
        public int      StaffId             { get; set; }
        public string   StaffFullName       { get; set; } = "";
        public int      TotalSessions       { get; set; }
        public int      UsedSessions        { get; set; }
        public int      RemainingSessions   { get; set; }
        public decimal  TotalPrice          { get; set; }
        public decimal  PaidAmount          { get; set; }
        public decimal  RemainingPayment    { get; set; }
        public int      PaymentMethodValue  { get; set; }
        public string   PaymentMethodDisplay { get; set; } = "";
        public DateTime StartDate           { get; set; }
        public DateTime EndDate             { get; set; }
        public int      StatusValue         { get; set; }
        public string   StatusDisplay       { get; set; } = "";
        public string?  Notes               { get; set; }
        public DateTime CreatedAt           { get; set; }

        public List<PackageSaleUsageDto>   Usages   { get; set; } = new();
        public List<PackageSalePaymentDto> Payments { get; set; } = new();
    }

    // ─── PackageSale Usage ───

    public class PackageSaleUsageCreateDto
    {
        public DateTime? UsageDate { get; set; }
        public int?      StaffId   { get; set; }

        [StringLength(500)]
        public string?   Notes     { get; set; }
    }

    public class PackageSaleUsageDto
    {
        public int      Id        { get; set; }
        public DateTime UsageDate { get; set; }
        public int?     StaffId   { get; set; }
        public string?  StaffFullName { get; set; }
        public string?  Notes     { get; set; }
    }

    // ─── PackageSale Payment ───

    public class PackageSalePaymentCreateDto
    {
        [Range(0.01, 9999999.99, ErrorMessage = "Ödeme tutarı geçerli bir değer olmalıdır.")]
        public decimal Amount { get; set; }

        public API_BeautyWise.Enums.PaymentMethod PaymentMethod { get; set; } = API_BeautyWise.Enums.PaymentMethod.Cash;

        public DateTime? PaidAt { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }

    public class PackageSalePaymentDto
    {
        public int      Id                   { get; set; }
        public decimal  Amount               { get; set; }
        public int      PaymentMethodValue   { get; set; }
        public string   PaymentMethodDisplay { get; set; } = "";
        public DateTime PaidAt               { get; set; }
        public string?  Notes                { get; set; }
    }

    // ─── PackageSale Stats ───

    public class PackageSaleStatsDto
    {
        public int     TotalSales       { get; set; }
        public decimal TotalRevenue     { get; set; }
        public int     ActivePackages   { get; set; }
        public int     CompletedPackages { get; set; }
    }
}
