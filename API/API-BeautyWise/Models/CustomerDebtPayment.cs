namespace API_BeautyWise.Models
{
    /// <summary>
    /// Borç/alacak ödeme kaydı (tahsilat).
    /// </summary>
    public class CustomerDebtPayment : BaseEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int CustomerDebtId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = "Cash"; // Cash, Card, BankTransfer, Other
        public string? Notes { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.Now;

        // Navigation
        public virtual CustomerDebt CustomerDebt { get; set; } = null!;
    }
}
