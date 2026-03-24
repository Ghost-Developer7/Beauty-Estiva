namespace API_BeautyWise.DTO
{
    /// <summary>Rol değiştirme isteği</summary>
    public class ChangeRoleRequestDto
    {
        public int TargetUserId { get; set; }
        public string NewRole { get; set; } = "";
        public string? Reason { get; set; }
    }

    /// <summary>Audit log kayıt DTO'su</summary>
    public class RoleChangeAuditLogDto
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string TenantName { get; set; } = "";
        public int TargetUserId { get; set; }
        public string TargetUserName { get; set; } = "";
        public int PerformedByUserId { get; set; }
        public string PerformedByUserName { get; set; } = "";
        public string ActionType { get; set; } = "";
        public string OldRole { get; set; } = "";
        public string NewRole { get; set; } = "";
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>Audit log filtreleme parametreleri</summary>
    public class AuditLogFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? TenantId { get; set; }
        public int? TargetUserId { get; set; }
        public int? PerformedByUserId { get; set; }
        public string? ActionType { get; set; }
        public string? RoleName { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    /// <summary>Sayfalanmış sonuç</summary>
    public class PaginatedResultDto<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}
