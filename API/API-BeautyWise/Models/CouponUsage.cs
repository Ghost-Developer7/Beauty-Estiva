using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class CouponUsage : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public int CouponId { get; set; }
        public int TenantId { get; set; }
        public int SubscriptionId { get; set; }

        public decimal OriginalPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal FinalPrice { get; set; }

        public DateTime UsedDate { get; set; }

        // İlişkiler
        [ForeignKey("CouponId")]
        public Coupon Coupon { get; set; }

        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }

        [ForeignKey("SubscriptionId")]
        public TenantSubscription Subscription { get; set; }
    }
}
