namespace API_BeautyWise.DTO
{
    public class StaffListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public string Email { get; set; } = "";
        public string? Phone { get; set; }
        public DateTime? BirthDate { get; set; }
        public List<string> Roles { get; set; } = new();
        public bool IsActive { get; set; }
        public bool IsApproved { get; set; }
        public decimal DefaultCommissionRate { get; set; }
        public DateTime? CDate { get; set; }
    }
}
