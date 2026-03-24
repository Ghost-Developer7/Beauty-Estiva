using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.Models
{
    public class SubscriptionPlan : BaseEntity
    {// SAAS SAHİBİ (SİZİN) OLUŞTURACAĞINIZ PAKETLER
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } // Örn: Başlangıç Paketi, Gold Paket, Platinum

        [MaxLength(500)]
        public string? Description { get; set; } // Paket açıklaması

        public decimal MonthlyPrice { get; set; } // Aylık Ücret
        public decimal YearlyPrice { get; set; } // Yıllık Ücret

        // Paket Limitleri (Limitsiz ise -1 yapılabilir)
        public int MaxStaffCount { get; set; } // Kaç personel ekleyebilir?
        public int MaxBranchCount { get; set; } // Şube desteği var mı?
        public bool HasSmsIntegration { get; set; } // SMS entegrasyonu açık mı?
        public bool HasWhatsappIntegration { get; set; } // WhatsApp entegrasyonu açık mı?
        public bool HasSocialMediaIntegration { get; set; } // Sosyal medya entegrasyonu açık mı?
        public bool HasAiFeatures { get; set; } // Yapay zeka özellikleri açık mı? (Şu an kullanılmıyor)

        /// <summary>
        /// Paket özelliklerinin JSON formatında saklanması (ek özellik bayrakları).
        /// Örn: {"sms":true,"whatsapp":true,"socialMedia":false}
        /// </summary>
        [MaxLength(2000)]
        public string? Features { get; set; }

        /// <summary>
        /// Geçerlilik süresi (ay cinsinden). Varsayılan 1 ay.
        /// </summary>
        public int ValidityMonths { get; set; } = 1;

        // İlişkiler
        public ICollection<Tenant> Tenants { get; set; }
    }
}
