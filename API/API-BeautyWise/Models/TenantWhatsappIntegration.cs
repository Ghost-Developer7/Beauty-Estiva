using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class TenantWhatsappIntegration : BaseEntity
    {
        [Key]
        public int Id { get; set; }
        public int TenantId { get; set; }

        // --- WHATSAPP ENTEGRASYONU ---
        public string? WhatsappApiToken { get; set; }
        public string? WhatsappInstanceId { get; set; }

        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }
    }
}
