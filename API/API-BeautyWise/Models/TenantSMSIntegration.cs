using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class TenantSMSIntegration : BaseEntity
    {
        [Key]
        public int Id { get; set; }
        public int TenantId { get; set; }

        // --- SMS ENTEGRASYONU ---
        public string? SmsProvider { get; set; } // Netgsm, Iletimerkezi vs.
        public string? SmsHeader { get; set; } // Başlık (Örn: LIVA_GUZEL)
        public string? SmsApiUser { get; set; }
        public string? SmsApiKey { get; set; }

        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }
    }
}
