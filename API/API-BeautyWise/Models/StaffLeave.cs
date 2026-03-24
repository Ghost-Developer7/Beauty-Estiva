using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    /// <summary>
    /// Personel izin talepleri.
    /// Yillik izin, hastalik, dogum izni, ucretsiz izin vb. turleri icerir.
    /// </summary>
    public class StaffLeave : BaseEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int StaffId { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        /// <summary>Annual, Sick, Maternity, Unpaid, Other</summary>
        public string LeaveType { get; set; } = "Annual";

        public string? Reason { get; set; }

        /// <summary>Pending, Approved, Rejected</summary>
        public string Status { get; set; } = "Pending";

        public int? ApprovedById { get; set; }
        public DateTime? ApprovedDate { get; set; }

        // Navigation
        [ForeignKey("TenantId")]
        public virtual Tenant Tenant { get; set; } = null!;

        [ForeignKey("StaffId")]
        public virtual AppUser Staff { get; set; } = null!;

        [ForeignKey("ApprovedById")]
        public virtual AppUser? ApprovedBy { get; set; }
    }
}
