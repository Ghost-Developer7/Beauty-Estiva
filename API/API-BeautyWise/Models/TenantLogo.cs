using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class TenantLogo : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; } // Hangi işletmeye ait?

        [Required]
        public string ImageUrl { get; set; } // Dosya yolu (Örn: /uploads/tenant_5/logo_v2.png)

        public string? FileName { get; set; } // Orijinal dosya adı (Opsiyonel)

        public long FileSize { get; set; } // Dosya boyutu (Opsiyonel - KB/MB takibi için)

        // KRİTİK ALAN: Hangi logo şu an yayında?
        // Bir Tenant için sadece 1 kayıt 'True' olabilir, diğerleri 'False' olmalı.
        public bool IsSelected { get; set; } = true;

        // İlişki
        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }
    }
}
