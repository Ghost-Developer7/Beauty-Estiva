using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    // ── Create ──
    public class CreateBranchDto
    {
        [Required, MaxLength(200)]
        public string Name { get; set; } = "";

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(30)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Email { get; set; }

        public string? WorkingHoursJson { get; set; }
        public bool IsMainBranch { get; set; }
    }

    // ── Update ──
    public class UpdateBranchDto
    {
        [Required, MaxLength(200)]
        public string Name { get; set; } = "";

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(30)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Email { get; set; }

        public string? WorkingHoursJson { get; set; }
        public bool IsMainBranch { get; set; }
        public bool IsActive { get; set; } = true;
    }

    // ── List ──
    public class BranchListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public bool IsMainBranch { get; set; }
        public bool IsActive { get; set; }
        public int StaffCount { get; set; }
        public DateTime? CDate { get; set; }
    }

    // ── Detail ──
    public class BranchDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? WorkingHoursJson { get; set; }
        public bool IsMainBranch { get; set; }
        public bool IsActive { get; set; }
        public int StaffCount { get; set; }
        public DateTime? CDate { get; set; }
        public List<BranchStaffDto> Staff { get; set; } = new();
    }

    // ── Branch Staff ──
    public class BranchStaffDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public string Email { get; set; } = "";
        public List<string> Roles { get; set; } = new();
    }

    // ── Assign Staff ──
    public class AssignStaffToBranchDto
    {
        [Required]
        public int StaffId { get; set; }
    }

    // ── Branch Limit Info ──
    public class BranchLimitDto
    {
        public int CurrentCount { get; set; }
        public int MaxCount { get; set; }
        public bool CanAdd { get; set; }
        public string? Message { get; set; }
    }
}
