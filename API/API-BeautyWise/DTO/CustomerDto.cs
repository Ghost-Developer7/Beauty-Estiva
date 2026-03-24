using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    public class CustomerCreateDto
    {
        [Required(ErrorMessage = "Ad gereklidir.")]
        [StringLength(100, ErrorMessage = "Ad en fazla 100 karakter olabilir.")]
        public string Name { get; set; } = "";

        [Required(ErrorMessage = "Soyad gereklidir.")]
        [StringLength(100, ErrorMessage = "Soyad en fazla 100 karakter olabilir.")]
        public string Surname { get; set; } = "";

        [StringLength(20)]
        public string Phone { get; set; } = "";

        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
        [StringLength(256)]
        public string? Email { get; set; }

        public DateTime? BirthDate { get; set; }

        [StringLength(1000, ErrorMessage = "Notlar en fazla 1000 karakter olabilir.")]
        public string? Notes { get; set; }

        // ── Loyalty & History optional fields on create ──
        public string? Allergies { get; set; }
        public string? Preferences { get; set; }
        public string? ReferralSource { get; set; }
        public int? PreferredStaffId { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class CustomerUpdateDto
    {
        [Required(ErrorMessage = "Ad gereklidir.")]
        [StringLength(100)]
        public string Name { get; set; } = "";

        [Required(ErrorMessage = "Soyad gereklidir.")]
        [StringLength(100)]
        public string Surname { get; set; } = "";

        [StringLength(20)]
        public string Phone { get; set; } = "";

        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
        [StringLength(256)]
        public string? Email { get; set; }

        public DateTime? BirthDate { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        // ── Loyalty & History optional fields on update ──
        public string? Allergies { get; set; }
        public string? Preferences { get; set; }
        public string? ReferralSource { get; set; }
        public int? PreferredStaffId { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class CustomerListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public string FullName => $"{Name} {Surname}";
        public string Phone { get; set; } = "";
        public string? Email { get; set; }
        public int TotalAppointments { get; set; }
        public DateTime? LastAppointmentDate { get; set; }

        // ── Loyalty ──
        public int LoyaltyPoints { get; set; }
        public decimal TotalSpent { get; set; }
        public int TotalVisits { get; set; }
        public string Segment { get; set; } = "New";
        public List<string> Tags { get; set; } = new();
        public DateTime? CustomerSince { get; set; }
    }

    public class CustomerDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public string FullName => $"{Name} {Surname}";
        public string Phone { get; set; } = "";
        public string? Email { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Notes { get; set; }
        public DateTime? CDate { get; set; }
        public int TotalAppointments { get; set; }
        public List<CustomerAppointmentSummaryDto> RecentAppointments { get; set; } = new();

        // ── Loyalty & History ──
        public int LoyaltyPoints { get; set; }
        public decimal TotalSpent { get; set; }
        public int TotalVisits { get; set; }
        public DateTime? LastVisitDate { get; set; }
        public DateTime? CustomerSince { get; set; }
        public int? PreferredStaffId { get; set; }
        public string? PreferredStaffName { get; set; }
        public string? Allergies { get; set; }
        public string? Preferences { get; set; }
        public List<string> Tags { get; set; } = new();
        public string? ReferralSource { get; set; }
        public string Segment { get; set; } = "New";
        public decimal AverageSpendPerVisit { get; set; }
    }

    public class CustomerAppointmentSummaryDto
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public string TreatmentName { get; set; } = "";
        public string StaffName { get; set; } = "";
        public string Status { get; set; } = "";
        public decimal? Amount { get; set; }
        public int? DurationMinutes { get; set; }
    }
}
