using System.ComponentModel.DataAnnotations;
using API_BeautyWise.Enums;

namespace API_BeautyWise.DTO
{
    public class AppointmentCreateDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Müşteri seçimi gereklidir.")]
        public int CustomerId { get; set; }

        public int StaffId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Hizmet seçimi gereklidir.")]
        public int TreatmentId { get; set; }

        public DateTime StartTime { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        public bool IsRecurring { get; set; } = false;

        [Range(1, 365, ErrorMessage = "Tekrar aralığı 1-365 gün arasında olmalıdır.")]
        public int? RecurrenceIntervalDays { get; set; }

        [Range(1, 52, ErrorMessage = "Seans sayısı 1-52 arasında olmalıdır.")]
        public int? TotalSessions { get; set; }
    }

    public class AppointmentUpdateDto
    {
        public int StaffId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Hizmet seçimi gereklidir.")]
        public int TreatmentId { get; set; }

        public DateTime StartTime { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        public AppointmentStatus Status { get; set; }
    }

    /// <summary>Randevu durum güncelleme (Tamamlandı, İptal vb.)</summary>
    public class AppointmentStatusUpdateDto
    {
        public AppointmentStatus Status { get; set; }
        public string? Notes { get; set; }
    }

    /// <summary>Randevu liste özeti (takvim veya liste görünümü için)</summary>
    public class AppointmentListDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerFullName { get; set; } = "";
        public string CustomerPhone { get; set; } = "";
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public int TreatmentId { get; set; }
        public string TreatmentName { get; set; } = "";
        public string? TreatmentColor { get; set; }
        public int DurationMinutes { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = "";
        public string? Notes { get; set; }
        public bool IsRecurring { get; set; }
        public int SessionNumber { get; set; }
        public int? TotalSessions { get; set; }
        public int? ParentAppointmentId { get; set; }
    }

    /// <summary>Randevu detay (tek randevu görüntüleme)</summary>
    public class AppointmentDetailDto : AppointmentListDto
    {
        public int? RecurrenceIntervalDays { get; set; }
        public List<AppointmentListDto> SeriesAppointments { get; set; } = new(); // Tüm seri randevuları
    }

    /// <summary>Personel müsaitlik durumu sorgulama isteği</summary>
    public class StaffAvailabilityRequestDto
    {
        public int StaffId { get; set; }
        public int TreatmentId { get; set; }
        public DateTime Date { get; set; }  // Hangi gün sorgulanacak
    }

    /// <summary>Personel müsaitlik yanıtı</summary>
    public class StaffAvailabilityResultDto
    {
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public DateTime Date { get; set; }
        public List<TimeSlotDto> AvailableSlots { get; set; } = new();
        public List<TimeSlotDto> BlockedSlots { get; set; } = new();
    }

    public class TimeSlotDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? BlockReason { get; set; }  // null=müsait, dolu ise neden
    }

    /// <summary>Randevu çakışma bilgisi (hata durumunda döner)</summary>
    public class AppointmentConflictDto
    {
        public bool HasConflict { get; set; }
        public string? ConflictType { get; set; }     // "Appointment" | "Unavailability"
        public string? ConflictDetail { get; set; }   // Çakışan randevu/kapalı gün açıklaması
        public DateTime? ConflictStart { get; set; }
        public DateTime? ConflictEnd { get; set; }
    }
}
