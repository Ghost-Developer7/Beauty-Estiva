using System.ComponentModel.DataAnnotations.Schema;

namespace API_BeautyWise.Models
{
    /// <summary>
    /// Personel haftalik vardiya/mesai tanimi.
    /// Her personel icin haftanin her gunu icin baslangic-bitis saati, mola saati ve calisma durumu tutulur.
    /// </summary>
    public class StaffShift : BaseEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int StaffId { get; set; }

        /// <summary>0=Sunday, 1=Monday ... 6=Saturday</summary>
        public int DayOfWeek { get; set; }

        /// <summary>Mesai baslangic saati (ornek: 09:00)</summary>
        public TimeSpan StartTime { get; set; }

        /// <summary>Mesai bitis saati (ornek: 18:00)</summary>
        public TimeSpan EndTime { get; set; }

        /// <summary>Mola baslangic saati (ornek: 12:00)</summary>
        public TimeSpan? BreakStartTime { get; set; }

        /// <summary>Mola bitis saati (ornek: 13:00)</summary>
        public TimeSpan? BreakEndTime { get; set; }

        /// <summary>Bu gun calisma gunu mu?</summary>
        public bool IsWorkingDay { get; set; } = true;

        // Navigation
        [ForeignKey("TenantId")]
        public virtual Tenant Tenant { get; set; } = null!;

        [ForeignKey("StaffId")]
        public virtual AppUser Staff { get; set; } = null!;
    }
}
