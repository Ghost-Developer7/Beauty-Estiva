namespace API_BeautyWise.DTO
{
    // ── Liste/Detay ──
    public class StaffShiftDto
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public int DayOfWeek { get; set; }
        public string StartTime { get; set; } = "";   // "09:00"
        public string EndTime { get; set; } = "";     // "18:00"
        public string? BreakStartTime { get; set; }    // "12:00"
        public string? BreakEndTime { get; set; }      // "13:00"
        public bool IsWorkingDay { get; set; }
    }

    // ── Haftalik gorunum (tum personeller) ──
    public class StaffWeeklyShiftDto
    {
        public int StaffId { get; set; }
        public string StaffFullName { get; set; } = "";
        public List<StaffShiftDto> Shifts { get; set; } = new();
    }

    // ── Tekil vardiya olusturma/guncelleme ──
    public class StaffShiftUpsertDto
    {
        public int DayOfWeek { get; set; }
        public string StartTime { get; set; } = "09:00";
        public string EndTime { get; set; } = "18:00";
        public string? BreakStartTime { get; set; }
        public string? BreakEndTime { get; set; }
        public bool IsWorkingDay { get; set; } = true;
    }

    // ── Toplu guncelleme (7 gun birden) ──
    public class StaffShiftBulkUpdateDto
    {
        public List<StaffShiftUpsertDto> Shifts { get; set; } = new();
    }
}
