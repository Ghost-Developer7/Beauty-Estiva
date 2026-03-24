using API_BeautyWise.Enums;

namespace API_BeautyWise.Models
{
    /// <summary>
    /// Paket satış kaydı.
    /// Bir müşteriye belirli bir hizmetten çoklu seans paketi satışını temsil eder.
    /// </summary>
    public class PackageSale : BaseEntity
    {
        public int Id       { get; set; }
        public int TenantId { get; set; }

        public int CustomerId  { get; set; }
        public int TreatmentId { get; set; }
        public int StaffId     { get; set; }   // Satışı yapan personel

        public int TotalSessions { get; set; }
        public int UsedSessions  { get; set; } = 0;

        public decimal TotalPrice  { get; set; }
        public decimal PaidAmount  { get; set; }

        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime EndDate   { get; set; }

        public PackageSaleStatus Status { get; set; } = PackageSaleStatus.Active;

        public string? Notes { get; set; }

        // Navigation
        public virtual Tenant    Tenant    { get; set; } = null!;
        public virtual Customer  Customer  { get; set; } = null!;
        public virtual Treatment Treatment { get; set; } = null!;
        public virtual AppUser   Staff     { get; set; } = null!;
        public virtual ICollection<PackageSaleUsage> Usages { get; set; } = new List<PackageSaleUsage>();
        public virtual ICollection<PackageSalePayment> Payments { get; set; } = new List<PackageSalePayment>();
    }
}
