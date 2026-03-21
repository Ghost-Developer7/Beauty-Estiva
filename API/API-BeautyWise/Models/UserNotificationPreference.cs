using API_BeautyWise.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class UserNotificationPreference : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public int AppUserId { get; set; } // Hangi çalışan?

        public NotificationChannel Channel { get; set; } // Hangi kanal?

        public bool IsEnabled { get; set; } // Çalışan bunu almak istiyor mu?

        [ForeignKey("AppUserId")]
        public AppUser AppUser { get; set; }
    }
}
