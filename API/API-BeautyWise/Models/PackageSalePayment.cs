using API_BeautyWise.Enums;

namespace API_BeautyWise.Models
{
    /// <summary>
    /// Paket satışı ödeme kaydı.
    /// Taksitli veya parçalı ödeme desteği sağlar.
    /// </summary>
    public class PackageSalePayment : BaseEntity
    {
        public int Id            { get; set; }
        public int PackageSaleId { get; set; }
        public int TenantId      { get; set; }

        public decimal      Amount        { get; set; }
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public DateTime      PaidAt        { get; set; } = DateTime.UtcNow;
        public string?       Notes         { get; set; }

        // Navigation
        public virtual PackageSale PackageSale { get; set; } = null!;
        public virtual Tenant      Tenant      { get; set; } = null!;
    }
}
