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
    }

    public class CustomerAppointmentSummaryDto
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public string TreatmentName { get; set; } = "";
        public string StaffName { get; set; } = "";
        public string Status { get; set; } = "";
    }
}
