using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class Branch : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required, MaxLength(200)]
        public string Name { get; set; } = ""; // e.g. "Merkez Sube", "Kadikoy Sube"

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(30)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Email { get; set; }

        /// <summary>
        /// Per-branch working hours stored as JSON.
        /// Format: [{"day":0,"open":"09:00","close":"18:00","isClosed":false}, ...]
        /// </summary>
        [MaxLength(2000)]
        public string? WorkingHoursJson { get; set; }

        /// <summary>
        /// Primary branch flag. Only one branch per tenant should be marked as main.
        /// </summary>
        public bool IsMainBranch { get; set; }

        // --- Navigation ---
        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }

        public ICollection<AppUser> Staff { get; set; } = new List<AppUser>();
    }
}
