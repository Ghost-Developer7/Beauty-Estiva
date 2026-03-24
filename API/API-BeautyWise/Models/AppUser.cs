using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class AppUser : IdentityUser<int>
    {
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public DateTime? BirthDate { get; set; }

        // --- PROFİL RESMİ ---
        public string? ProfilePicturePath { get; set; }

        // --- KOMİSYON ---
        // Personelin genel komisyon oranı (0-100 arası yüzde). Varsayılan 0 = komisyon yok.
        public decimal DefaultCommissionRate { get; set; } = 0m;

        // --- SAAS BAĞLANTISI (ZORUNLU) ---
        // Kullanıcı hangi işletmeye ait?
        public int TenantId { get; set; }

        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }


        // --- İLİŞKİLER ---
        // Personelin bildirim tercihleri (Whatsapp gelsin, SMS gelmesin vb.)
        public ICollection<UserNotificationPreference> NotificationPreferences { get; set; }


        // --- AUDIT LOGLARI ---
        public int? CUser { get; set; }
        public int? UUser { get; set; }
        public DateTime? CDate { get; set; }
        public DateTime? UDate { get; set; }
        public bool? IsActive { get; set; }
        public bool IsApproved { get; set; } = false;
    }
}
