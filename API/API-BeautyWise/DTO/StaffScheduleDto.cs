namespace API_BeautyWise.DTO
{
    /// <summary>Personel müsaitlik dışı kaydı oluşturma</summary>
    public class StaffUnavailabilityCreateDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        /// <summary>İzin | Öğle Molası | Toplantı | Hasta | Diğer</summary>
        public string Reason { get; set; } = "Diğer";
        public string? Notes { get; set; }
    }

    /// <summary>Personel müsaitlik dışı kaydı güncelleme</summary>
    public class StaffUnavailabilityUpdateDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Reason { get; set; } = "Diğer";
        public string? Notes { get; set; }
    }

    /// <summary>Personel müsaitlik dışı kaydı listesi</summary>
    public class StaffUnavailabilityListDto
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Reason { get; set; } = "";
        public string? Notes { get; set; }
    }

    /// <summary>Personelin günlük programı (randevu + kapalı aralıklar birlikte)</summary>
    public class StaffDailyScheduleDto
    {
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public DateTime Date { get; set; }
        public List<AppointmentListDto> Appointments { get; set; } = new();
        public List<StaffUnavailabilityListDto> UnavailablePeriods { get; set; } = new();
    }
}
