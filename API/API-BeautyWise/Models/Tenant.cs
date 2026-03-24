using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class Tenant : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantUUID { get; set; }

        [Required, MaxLength(250)]
        public string CompanyName { get; set; }

        [MaxLength(20)]
        public string TaxNumber { get; set; }
        [MaxLength(100)]
        public string TaxOffice { get; set; }

        public string Address { get; set; }
        public string Phone { get; set; }

        // --- GENEL AYARLAR ---
        public int ReminderHourBefore { get; set; } = 24;

        // Çalışma saatleri (JSON olarak saklanır)
        public string? WorkingHoursJson { get; set; }

        // Tatil günleri (JSON olarak saklanır)
        public string? HolidaysJson { get; set; }

        // Para birimi (varsayılan TRY)
        [MaxLength(10)]
        public string Currency { get; set; } = "TRY";

        // Saat dilimi
        [MaxLength(50)]
        public string Timezone { get; set; } = "Europe/Istanbul";

        // Randevu slot süresi (dakika)
        public int AppointmentSlotMinutes { get; set; } = 30;

        // Randevuları otomatik onayla
        public bool AutoConfirmAppointments { get; set; } = false;

        // Randevular arası tampon süre (dakika)
        public int BufferMinutes { get; set; } = 0;


        // --- İLİŞKİLER (Collections & Navigations) ---

        // 1. Personeller
        public ICollection<AppUser> Users { get; set; }

        // 1b. Şubeler
        public ICollection<Branch> Branches { get; set; }

        // 2. Davetiyeler
        public ICollection<TenantInviteToken> InviteTokens { get; set; }

        // 3. Logolar
        public ICollection<TenantLogo> Logos { get; set; }

        // 4. Finans
        public ICollection<TenantPaymentHistory> PaymentHistories { get; set; }
        public ICollection<TenantSubscription> Subscriptions { get; set; }

        // 5. Bildirim Kuralları ve Geçmişi
        public ICollection<TenantNotificationRule> NotificationRules { get; set; }
        public ICollection<TenantNotificationHistory> NotificationHistories { get; set; }

        // 6. ENTEGRASYONLAR (1-to-1 veya 0-to-1 İlişkiler)
        // Bir işletmenin genelde tek bir aktif SMS/Whatsapp ayarı olur.
        public TenantPaymentIntegration? PaymentIntegration { get; set; }
        public TenantSMSIntegration? SMSIntegration { get; set; }
        public TenantWhatsappIntegration? WhatsappIntegration { get; set; }
        public TenantEmailIntegration? EmailIntegration { get; set; }
    }
}
