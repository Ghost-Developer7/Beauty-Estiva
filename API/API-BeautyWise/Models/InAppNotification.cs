using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class InAppNotification : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        /// <summary>
        /// null = tum tenant kullanicilarina broadcast bildirim
        /// </summary>
        public int? UserId { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = "";

        [Required, MaxLength(1000)]
        public string Message { get; set; } = "";

        /// <summary>
        /// Bildirim tipi: info, success, warning, error
        /// </summary>
        [MaxLength(20)]
        public string Type { get; set; } = "info";

        /// <summary>
        /// Iliskili entity tipi: Appointment, Customer, Payment, PackageSale, StaffLeave vb.
        /// </summary>
        [MaxLength(50)]
        public string? EntityType { get; set; }

        /// <summary>
        /// Iliskili entity ID (frontend navigasyonu icin)
        /// </summary>
        public int? EntityId { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }

        /// <summary>
        /// Frontend route: /appointments/123, /customers/45 vb.
        /// </summary>
        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        /// <summary>
        /// Icon tanimlayicisi: calendar, user, payment, package, warning vb.
        /// </summary>
        [MaxLength(50)]
        public string? Icon { get; set; }

        /// <summary>
        /// Ayni bildirimin tekrar gonderilmesini onlemek icin.
        /// Format: {NotificationType}_{EntityId}_{Date:yyyyMMdd}
        /// Ornek: APPOINTMENT_CREATED_123_20260325
        /// </summary>
        [MaxLength(200)]
        public string? DeduplicationKey { get; set; }

        // Navigation properties
        [ForeignKey("TenantId")]
        public virtual Tenant Tenant { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual AppUser? User { get; set; }
    }
}
