using API_BeautyWise.Enums;
using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.Models
{
    public class TenantNotificationHistory
    {
        [Key]
        public int Id { get; set; }
        public int TenantId { get; set; }
        // Değişikliği yapan kişi (Patron veya Yönetici)
        public int ChangedByUserId { get; set; }
        public NotificationChannel Channel { get; set; }
        public bool OldValue { get; set; } // Eskiden neydi?
        public bool NewValue { get; set; } // Şimdi ne oldu?
        public DateTime ChangeDate { get; set; } = DateTime.Now;
    }
}
