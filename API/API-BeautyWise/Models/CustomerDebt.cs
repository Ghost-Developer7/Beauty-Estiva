namespace API_BeautyWise.Models
{
    /// <summary>
    /// Müşteri borç/alacak kaydı.
    /// Type = "Receivable" ise alacak, "Debt" ise borç.
    /// </summary>
    public class CustomerDebt : BaseEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int? CustomerId { get; set; }
        public string? PersonName { get; set; }             // Müşteri dışı borçlar için
        public string Type { get; set; } = "Receivable";    // "Receivable" (alacak) veya "Debt" (borç)
        public decimal Amount { get; set; }
        public decimal PaidAmount { get; set; } = 0;
        public string? Currency { get; set; } = "TRY";
        public string? Description { get; set; }
        public string? Notes { get; set; }
        public DateTime? DueDate { get; set; }
        public string Status { get; set; } = "Pending";     // Pending, PartiallyPaid, Paid, Overdue, Cancelled
        public int? RelatedAppointmentId { get; set; }
        public int? RelatedPackageSaleId { get; set; }
        public string? Source { get; set; }                  // "Appointment", "PackageSale", "Manual", "Product"

        // Navigation
        public virtual Tenant Tenant { get; set; } = null!;
        public virtual Customer? Customer { get; set; }
        public virtual ICollection<CustomerDebtPayment> Payments { get; set; } = new List<CustomerDebtPayment>();
    }
}
