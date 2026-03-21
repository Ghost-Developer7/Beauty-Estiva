using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class TenantSubscription : BaseEntity
    {   // --- ABONELÝK BÝLGÝLERÝ ---
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; } // Hangi iþletme?

        public int SubscriptionPlanId { get; set; } // Hangi paket?

        // KRÝTÝK: Plan fiyatlarý ileride deðiþebilir. 
        // O an kaça satýldýysa buraya kopyalamalýyýz (Snapshot).
        public decimal PriceSold { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // --- DENEME SÜRESÝ ---
        public bool IsTrialPeriod { get; set; } = false; // Ýlk 7 gün deneme mi?
        public DateTime? TrialEndDate { get; set; } // Deneme bitiþ tarihi

        // --- OTOMATÝK YENÝLEME ---
        public bool AutoRenew { get; set; } = true; // Otomatik yenilensin mi?
        public DateTime? NextRenewalDate { get; set; } // Bir sonraki yenileme tarihi

        // --- GRACE PERIOD (Ödeme baþarýsýz olursa ek süre) ---
        public bool IsInGracePeriod { get; set; } = false; // Grace period'da mý?
        public DateTime? GracePeriodEndDate { get; set; } // Grace period bitiþ tarihi
        public int FailedPaymentAttempts { get; set; } = 0; // Baþarýsýz ödeme denemesi sayýsý

        // --- ÖDEME DURUMU ---
        public string PaymentStatus { get; set; } = "Pending"; // Pending, Paid, Failed, Refunded
        public string? PaymentToken { get; set; } // PayTR merchant_oid buraya kaydedilir
        public string? PaymentTransactionId { get; set; } // PayTR referans numarasi buraya kaydedilir

        // --- ÝPTAL VE ÝADE ---
        public bool IsCancelled { get; set; } = false;
        public DateTime? CancelledDate { get; set; }
        public string? CancelReason { get; set; }
        public bool IsRefunded { get; set; } = false; // Ýade yapýldý mý?
        public decimal? RefundAmount { get; set; }
        public DateTime? RefundDate { get; set; }

        // --- ÝNDÝRÝM KUPONU ---
        public int? CouponId { get; set; }
        public decimal? DiscountAmount { get; set; } // Uygulanan indirim miktarý

        // Bu abonelik þu an aktif olan abonelik mi?
        // Bir Tenant'ýn sadece 1 tane IsActive=true olan kaydý olmalý.
        public bool IsActive { get; set; } = true;

        // Ýliþkiler
        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }

        [ForeignKey("SubscriptionPlanId")]
        public SubscriptionPlan SubscriptionPlan { get; set; }

        [ForeignKey("CouponId")]
        public Coupon? Coupon { get; set; }
    }
}
