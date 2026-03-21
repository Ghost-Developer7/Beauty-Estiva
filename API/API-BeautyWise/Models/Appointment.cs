using API_BeautyWise.Enums;

namespace API_BeautyWise.Models
{
    /// <summary>
    /// Randevu kaydı.
    /// - Personel + Müşteri + Hizmet bağlantılıdır.
    /// - Aynı personel için çakışan zaman aralığı oluşturulamaz.
    /// - Tekrarlayan seans desteği: IsRecurring=true ise bir sonraki
    ///   randevu otomatik oluşturulur.
    /// </summary>
    public class Appointment : BaseEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }

        public int CustomerId { get; set; }
        public int StaffId { get; set; }
        public int TreatmentId { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }   // StartTime + Treatment.DurationMinutes

        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
        public string? Notes { get; set; }

        // ----------------------------------------------------------------
        //  Tekrarlayan seans bilgisi
        //  Örnek: 5 seans, her 7 günde bir → haftalık seans planı
        // ----------------------------------------------------------------
        public bool IsRecurring { get; set; } = false;

        /// <summary>Her kaç günde bir tekrarlanır. Örn: 7 = haftalık, 30 = aylık</summary>
        public int? RecurrenceIntervalDays { get; set; }

        /// <summary>Toplam seans sayısı (0 veya null = sınırsız/manuel)</summary>
        public int? TotalSessions { get; set; }

        /// <summary>Bu randevu serideki kaçıncı seans (1'den başlar)</summary>
        public int SessionNumber { get; set; } = 1;

        /// <summary>Serinin ilk randevusunun Id'si (parent = ilk randevu)</summary>
        public int? ParentAppointmentId { get; set; }

        // Navigation
        public virtual Tenant Tenant { get; set; } = null!;
        public virtual Customer Customer { get; set; } = null!;
        public virtual AppUser Staff { get; set; } = null!;
        public virtual Treatment Treatment { get; set; } = null!;
        public virtual Appointment? ParentAppointment { get; set; }
        public virtual ICollection<Appointment> ChildAppointments { get; set; } = new List<Appointment>();
    }
}
