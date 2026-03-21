using API_BeautyWise.Enums;

namespace API_BeautyWise.DTO
{
    /// <summary>
    /// Randevu oluşturma isteği.
    /// Tekrarlayan seans için IsRecurring=true, RecurrenceIntervalDays ve TotalSessions doldurulur.
    /// </summary>
    public class AppointmentCreateDto
    {
        public int CustomerId { get; set; }
        public int StaffId { get; set; }
        public int TreatmentId { get; set; }
        public DateTime StartTime { get; set; }
        public string? Notes { get; set; }

        // Tekrarlayan seans
        public bool IsRecurring { get; set; } = false;

        /// <summary>Her kaç günde bir tekrar. Örn: 7=haftalık, 14=2 haftada bir, 30=aylık</summary>
        public int? RecurrenceIntervalDays { get; set; }

        /// <summary>Toplam seans sayısı. Örn: 5 seans</summary>
        public int? TotalSessions { get; set; }
    }

    /// <summary>Randevu güncelleme isteği</summary>
    public class AppointmentUpdateDto
    {
        public int StaffId { get; set; }
        public int TreatmentId { get; set; }
        public DateTime StartTime { get; set; }
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
