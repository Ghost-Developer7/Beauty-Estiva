namespace API_BeautyWise.DTO
{
    public class CustomerCreateDto
    {
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public string Phone { get; set; } = "";
        public string? Email { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? Notes { get; set; }
    }

    public class CustomerUpdateDto
    {
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public string Phone { get; set; } = "";
        public string? Email { get; set; }
        public DateTime? BirthDate { get; set; }
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
