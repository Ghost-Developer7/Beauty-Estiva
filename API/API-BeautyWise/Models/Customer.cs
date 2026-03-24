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

        // ── Loyalty & History ──
        public int LoyaltyPoints { get; set; } = 0;
        public decimal TotalSpent { get; set; } = 0;
        public int TotalVisits { get; set; } = 0;
        public DateTime? LastVisitDate { get; set; }
        public DateTime CustomerSince { get; set; } = DateTime.Now;
        public int? PreferredStaffId { get; set; }
        public string? Allergies { get; set; }
        public string? Preferences { get; set; }
        public string? Tags { get; set; }          // JSON array: ["VIP","Regular"]
        public string? ReferralSource { get; set; }

        // Navigation
        public virtual Tenant Tenant { get; set; } = null!;
        public virtual AppUser? PreferredStaff { get; set; }
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
