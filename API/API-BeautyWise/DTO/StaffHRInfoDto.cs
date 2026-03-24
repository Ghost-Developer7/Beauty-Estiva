namespace API_BeautyWise.DTO
{
    // ── Detay ──
    public class StaffHRInfoDto
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public DateTime? HireDate { get; set; }
        public string? Position { get; set; }
        public decimal? Salary { get; set; }
        public string SalaryCurrency { get; set; } = "TRY";
        public string? IdentityNumber { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public int AnnualLeaveEntitlement { get; set; }
        public int UsedLeaveDays { get; set; }
        public int RemainingLeaveDays { get; set; }
        public string? Notes { get; set; }
    }

    // ── Guncelleme ──
    public class StaffHRInfoUpdateDto
    {
        public DateTime? HireDate { get; set; }
        public string? Position { get; set; }
        public decimal? Salary { get; set; }
        public string? SalaryCurrency { get; set; }
        public string? IdentityNumber { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public int? AnnualLeaveEntitlement { get; set; }
        public string? Notes { get; set; }
    }

    // ── Ozet (liste gorunumu) ──
    public class StaffHRSummaryDto
    {
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public string? Position { get; set; }
        public DateTime? HireDate { get; set; }
        public decimal? Salary { get; set; }
        public string SalaryCurrency { get; set; } = "TRY";
        public int AnnualLeaveEntitlement { get; set; }
        public int UsedLeaveDays { get; set; }
        public int RemainingLeaveDays { get; set; }
        public List<string> Roles { get; set; } = new();
    }
}
