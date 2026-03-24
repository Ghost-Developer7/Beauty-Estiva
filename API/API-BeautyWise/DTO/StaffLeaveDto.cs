namespace API_BeautyWise.DTO
{
    // ── Liste ──
    public class StaffLeaveListDto
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DurationDays { get; set; }
        public string LeaveType { get; set; } = "";
        public string? Reason { get; set; }
        public string Status { get; set; } = "";
        public int? ApprovedById { get; set; }
        public string? ApprovedByName { get; set; }
        public DateTime? ApprovedDate { get; set; }
    }

    // ── Olusturma ──
    public class StaffLeaveCreateDto
    {
        public int? StaffId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string LeaveType { get; set; } = "Annual";
        public string? Reason { get; set; }
    }

    // ── Izin bakiyesi ──
    public class StaffLeaveBalanceDto
    {
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public int AnnualEntitlement { get; set; }
        public int UsedDays { get; set; }
        public int PendingDays { get; set; }
        public int RemainingDays { get; set; }
    }
}
