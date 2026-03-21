using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class Coupon : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Code { get; set; } // Kupon kodu (örn: "YILBASI2024")

        [MaxLength(200)]
        public string? Description { get; set; }

        // İndirim Tipi
        public bool IsPercentage { get; set; } // true: Yüzde, false: Sabit tutar
        public decimal DiscountAmount { get; set; } // Yüzde ise 10, 20 vb. Tutar ise 100, 200 TL

        // Geçerlilik
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // Kullanım Limiti
        public int? MaxUsageCount { get; set; } // null: Sınırsız, değer: Toplam kullanım limiti
        public int CurrentUsageCount { get; set; } = 0; // Şu ana kadar kaç kez kullanıldı

        // Hedef Kitle
        public bool IsGlobal { get; set; } // true: Herkes kullanabilir, false: Belirli tenant'lar
        public int? SpecificTenantId { get; set; } // Belirli bir işletmeye özel ise

        // İlişkiler
        [ForeignKey("SpecificTenantId")]
        public Tenant? SpecificTenant { get; set; }

        public ICollection<CouponUsage> CouponUsages { get; set; }
    }
}
