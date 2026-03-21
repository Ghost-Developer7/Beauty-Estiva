namespace API_BeautyWise.Models
{
    /// <summary>
    /// Personel müsaitlik dışı kaydı.
    /// Personel izin, öğle molası, toplantı gibi durumlar için
    /// zaman aralığını kapatır. Bu aralıklara randevu atanamaz.
    /// </summary>
    public class StaffUnavailability : BaseEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int StaffId { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        /// <summary>İzin, Öğle Molası, Toplantı, Hasta, Diğer</summary>
        public string Reason { get; set; } = "Diğer";

        public string? Notes { get; set; }

        // Navigation
        public virtual Tenant Tenant { get; set; } = null!;
        public virtual AppUser Staff { get; set; } = null!;
    }
}
