using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class TenantPaymentIntegration: BaseEntity
    {//PaymentMethodToken, SmsHeader, SmsUsername gibi teknik ve nadir değişen, ancak sistemin çalışması için gereken bilgileri burada tutuyoruz.
        [Key]
        public int Id { get; set; }
        public int TenantId { get; set; }

        // --- ÖDEME SİSTEMİ ---
        public string? PaymentProvider { get; set; } // Iyzico, Stripe vs.
        public string? PaymentMethodToken { get; set; } // Saklı kart token'ı

        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }
    }
}
