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
        public string? SmsHeader { get; set; } // Başlık (Örn: LIVA_GUZEL) — BDDK onaylı gönderici adı
        public string? SmsApiUser { get; set; }
        public string? SmsApiKey { get; set; }

        // --- İleti Merkezi API ---
        public string? SmsApiHash { get; set; } // İleti Merkezi API Hash
        public decimal CreditBalance { get; set; } = 0; // Önbellek: kalan SMS kredisi
        public DateTime? CreditBalanceUpdatedAt { get; set; }

        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }
    }
}
