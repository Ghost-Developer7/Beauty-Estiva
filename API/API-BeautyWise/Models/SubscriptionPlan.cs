using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.Models
{
    public class SubscriptionPlan : BaseEntity
    {// SAAS SAHİBİ (SİZİN) OLUŞTURACAĞINIZ PAKETLER
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } // Örn: Başlangıç Paketi, Gold Paket, Platinum

        public decimal MonthlyPrice { get; set; } // Aylık Ücret
        public decimal YearlyPrice { get; set; } // Yıllık Ücret

        // Paket Limitleri (Limitsiz ise -1 yapılabilir)
        public int MaxStaffCount { get; set; } // Kaç personel ekleyebilir?
        public int MaxBranchCount { get; set; } // Şube desteği var mı?
        public bool HasSmsIntegration { get; set; } // SMS entegrasyonu açık mı?
        public bool HasAiFeatures { get; set; } // Yapay zeka özellikleri açık mı?

        // İlişkiler
        public ICollection<Tenant> Tenants { get; set; }
    }
}
