namespace API_BeautyWise.Models
{
    /// <summary>
    /// Paket seans kullanım kaydı.
    /// Her kullanılan seans için bir kayıt oluşturulur.
    /// </summary>
    public class PackageSaleUsage : BaseEntity
    {
        public int Id            { get; set; }
        public int PackageSaleId { get; set; }
        public int TenantId      { get; set; }

        public DateTime UsageDate { get; set; } = DateTime.UtcNow;
        public int?     StaffId   { get; set; }   // Seansı yapan personel
        public string?  Notes     { get; set; }

        // Navigation
        public virtual PackageSale PackageSale { get; set; } = null!;
        public virtual Tenant      Tenant      { get; set; } = null!;
        public virtual AppUser?    Staff       { get; set; }
    }
}
