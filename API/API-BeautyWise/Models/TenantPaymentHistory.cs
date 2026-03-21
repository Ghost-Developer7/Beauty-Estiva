using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class TenantPaymentHistory : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }
        public int? SubscriptionId { get; set; } // Hangi abonelik için ödeme

        public decimal Amount { get; set; } // Ödenen Tutar
        public DateTime PaymentDate { get; set; }
        
        public string PaymentStatus { get; set; } // Success, Failed, Pending, Refunded
        public string? PaymentMethod { get; set; } // CreditCard, BankTransfer, etc.
        public string Description { get; set; } // "2025 Yıllık Gold Üyelik Yenileme"

        // PayTR Bilgileri
        public string? TransactionId { get; set; } // PayTR merchant_oid (bizim siparis ID)
        public string? PaymentToken { get; set; } // Kullanilmiyor (eski Iyzico alani)
        public string? PaymentId { get; set; } // PayTR referans numarasi
        public string? ConversationId { get; set; } // Kullanilmiyor (eski Iyzico alani)

        // İade Bilgileri
        public bool IsRefunded { get; set; } = false;
        public decimal? RefundAmount { get; set; }
        public DateTime? RefundDate { get; set; }
        public string? RefundReason { get; set; }

        // İlişkiler
        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }

        [ForeignKey("SubscriptionId")]
        public TenantSubscription? Subscription { get; set; }
    }
}
