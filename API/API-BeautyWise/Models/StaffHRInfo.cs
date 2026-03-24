using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    /// <summary>
    /// Personel ozluk bilgileri.
    /// Her personel icin bir kayit (one-to-one) tutulur.
    /// </summary>
    public class StaffHRInfo : BaseEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int StaffId { get; set; }

        public DateTime? HireDate { get; set; }

        /// <summary>Pozisyon: Kuafor, Guzellik Uzmani vb.</summary>
        public string? Position { get; set; }

        public decimal? Salary { get; set; }
        public string SalaryCurrency { get; set; } = "TRY";

        /// <summary>TC Kimlik No</summary>
        public string? IdentityNumber { get; set; }

        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }

        /// <summary>Yillik izin hakki (gun)</summary>
        public int AnnualLeaveEntitlement { get; set; } = 14;

        /// <summary>Kullanilan izin gunleri</summary>
        public int UsedLeaveDays { get; set; } = 0;

        public string? Notes { get; set; }

        // Navigation
        [ForeignKey("TenantId")]
        public virtual Tenant Tenant { get; set; } = null!;

        [ForeignKey("StaffId")]
        public virtual AppUser Staff { get; set; } = null!;
    }
}
