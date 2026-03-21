namespace API_BeautyWise.Models
{
    /// <summary>
    /// Güzellik merkezi hizmet / işlem tanımı.
    /// Her randevuya bir işlem bağlanır.
    /// Süre (DurationMinutes) çakışma kontrolünde kullanılır.
    /// </summary>
    public class Treatment : BaseEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }

        public string Name { get; set; } = "";           // "Saç Boyama", "Manikür", "Kaş Alımı"
        public string? Description { get; set; }
        public int DurationMinutes { get; set; }          // Kaç dakika sürer (çakışma kontrolü için)
        public decimal? Price { get; set; }               // Hizmet fiyatı (opsiyonel)
        public string? Color { get; set; }                // Takvim görünümü için renk (#hex)

        // Navigation
        public virtual Tenant Tenant { get; set; } = null!;
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
