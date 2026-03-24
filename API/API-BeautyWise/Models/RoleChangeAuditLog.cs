using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class RoleChangeAuditLog
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        /// <summary>Rolü değiştirilen kullanıcı</summary>
        public int TargetUserId { get; set; }

        /// <summary>İşlemi yapan kullanıcı</summary>
        public int PerformedByUserId { get; set; }

        /// <summary>"RoleAdded" veya "RoleRemoved"</summary>
        [Required, MaxLength(50)]
        public string ActionType { get; set; } = "";

        /// <summary>Eski rol (kaldırma işleminde)</summary>
        [MaxLength(50)]
        public string OldRole { get; set; } = "";

        /// <summary>Yeni rol (ekleme işleminde)</summary>
        [MaxLength(50)]
        public string NewRole { get; set; } = "";

        /// <summary>İsteğe bağlı açıklama</summary>
        [MaxLength(500)]
        public string? Reason { get; set; }

        /// <summary>Hedef kullanıcının adı (snapshot)</summary>
        [MaxLength(200)]
        public string TargetUserName { get; set; } = "";

        /// <summary>İşlemi yapanın adı (snapshot)</summary>
        [MaxLength(200)]
        public string PerformedByUserName { get; set; } = "";

        /// <summary>Mağaza adı (snapshot)</summary>
        [MaxLength(250)]
        public string TenantName { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; } = null!;

        [ForeignKey("TargetUserId")]
        public AppUser TargetUser { get; set; } = null!;

        [ForeignKey("PerformedByUserId")]
        public AppUser PerformedByUser { get; set; } = null!;
    }
}
