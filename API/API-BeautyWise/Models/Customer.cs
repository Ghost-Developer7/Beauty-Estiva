namespace API_BeautyWise.Models
{
    /// <summary>
    /// Güzellik merkezi müşterisi.
    /// Randevular bu müşteriye bağlanır.
    /// </summary>
    public class Customer : BaseEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }

        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public string Phone { get; set; } = "";
        public string? Email { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Notes { get; set; }

        // Navigation
        public virtual Tenant Tenant { get; set; } = null!;
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
