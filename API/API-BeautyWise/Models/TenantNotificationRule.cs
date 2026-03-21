using API_BeautyWise.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    public class TenantNotificationRule : BaseEntity
    {//İşletme sahibi "Bizde Whatsapp yok" dediğinde buraya Channel: Whatsapp, IsActive: False olarak kaydedilir.
        [Key]
        public int Id { get; set; }
        public int TenantId { get; set; }

        public NotificationChannel Channel { get; set; } // SMS, Email...Enums

        // İşletme bu kanalı aktif etti mi? 
        // Eğer bu False ise, personel istese de seçemez.
        public bool IsActive { get; set; }

        [ForeignKey("TenantId")]
        public Tenant Tenant { get; set; }
    }
}
