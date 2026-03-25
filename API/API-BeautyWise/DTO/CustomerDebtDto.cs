using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    // ─── List / Detail DTO ──────────────────────────────────────────────────────

    public class CustomerDebtDto
    {
        public int      Id                   { get; set; }
        public int      TenantId             { get; set; }
        public int?     CustomerId           { get; set; }
        public string?  CustomerName         { get; set; }
        public string?  CustomerPhone        { get; set; }
        public string?  PersonName           { get; set; }
        public string   Type                 { get; set; } = "Receivable";
        public decimal  Amount               { get; set; }
        public decimal  PaidAmount           { get; set; }
        public decimal  RemainingAmount      { get; set; }
        public string?  Currency             { get; set; }
        public string?  Description          { get; set; }
        public string?  Notes                { get; set; }
        public DateTime? DueDate             { get; set; }
        public string   Status               { get; set; } = "Pending";
        public int?     RelatedAppointmentId { get; set; }
        public int?     RelatedPackageSaleId { get; set; }
        public string?  Source               { get; set; }
        public DateTime? CDate               { get; set; }
        public List<CustomerDebtPaymentDto> Payments { get; set; } = new();
    }

    // ─── Create ─────────────────────────────────────────────────────────────────

    public class CreateCustomerDebtDto
    {
        public int?     CustomerId           { get; set; }

        [StringLength(200)]
        public string?  PersonName           { get; set; }

        [Required(ErrorMessage = "Tür gereklidir.")]
        [StringLength(20)]
        public string   Type                 { get; set; } = "Receivable";

        [Range(0.01, 99999999.99, ErrorMessage = "Tutar geçerli bir değer olmalıdır.")]
        public decimal  Amount               { get; set; }

        [StringLength(10)]
        public string?  Currency             { get; set; } = "TRY";

        [StringLength(500)]
        public string?  Description          { get; set; }

        [StringLength(1000)]
        public string?  Notes                { get; set; }

        public DateTime? DueDate             { get; set; }
        public int?     RelatedAppointmentId { get; set; }
        public int?     RelatedPackageSaleId { get; set; }

        [StringLength(50)]
        public string?  Source               { get; set; } = "Manual";
    }

    // ─── Update ─────────────────────────────────────────────────────────────────

    public class UpdateCustomerDebtDto
    {
        public int?     CustomerId           { get; set; }

        [StringLength(200)]
        public string?  PersonName           { get; set; }

        [Range(0.01, 99999999.99, ErrorMessage = "Tutar geçerli bir değer olmalıdır.")]
        public decimal  Amount               { get; set; }

        [StringLength(10)]
        public string?  Currency             { get; set; } = "TRY";

        [StringLength(500)]
        public string?  Description          { get; set; }

        [StringLength(1000)]
        public string?  Notes                { get; set; }

        public DateTime? DueDate             { get; set; }

        [StringLength(50)]
        public string?  Source               { get; set; }

        [StringLength(20)]
        public string?  Status               { get; set; }
    }

    // ─── Payment ────────────────────────────────────────────────────────────────

    public class CustomerDebtPaymentDto
    {
        public int      Id            { get; set; }
        public int      CustomerDebtId { get; set; }
        public decimal  Amount        { get; set; }
        public string   PaymentMethod { get; set; } = "Cash";
        public string?  Notes         { get; set; }
        public DateTime PaymentDate   { get; set; }
        public DateTime? CDate        { get; set; }
    }

    public class CreateDebtPaymentDto
    {
        [Range(0.01, 99999999.99, ErrorMessage = "Ödeme tutarı geçerli bir değer olmalıdır.")]
        public decimal  Amount        { get; set; }

        [Required(ErrorMessage = "Ödeme yöntemi gereklidir.")]
        [StringLength(50)]
        public string   PaymentMethod { get; set; } = "Cash";

        [StringLength(1000)]
        public string?  Notes         { get; set; }

        public DateTime? PaymentDate  { get; set; }
    }

    // ─── Summary ────────────────────────────────────────────────────────────────

    public class CustomerDebtSummaryDto
    {
        public decimal TotalAmount     { get; set; }
        public decimal TotalPaid       { get; set; }
        public decimal TotalRemaining  { get; set; }
        public int     TotalCount      { get; set; }
        public int     PendingCount    { get; set; }
        public int     PartialCount    { get; set; }
        public int     PaidCount       { get; set; }
        public int     OverdueCount    { get; set; }
    }

    // ─── Collection (tahsilat) list item ────────────────────────────────────────

    public class CollectionListDto
    {
        public int      Id              { get; set; }
        public int      CustomerDebtId  { get; set; }
        public string?  CustomerName    { get; set; }
        public string?  PersonName      { get; set; }
        public string?  DebtDescription { get; set; }
        public string   DebtType        { get; set; } = "Receivable";
        public decimal  Amount          { get; set; }
        public string   PaymentMethod   { get; set; } = "Cash";
        public string?  Notes           { get; set; }
        public DateTime PaymentDate     { get; set; }
        public string?  Source          { get; set; }
        public DateTime? CDate          { get; set; }
    }
}
