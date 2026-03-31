using System.Text.Json.Serialization;

namespace BeautyEstiva.Desktop.Models;

public class StaffMember
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("surname")]
    public string Surname { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [JsonPropertyName("birthDate")]
    public string? BirthDate { get; set; }

    [JsonPropertyName("roles")]
    public List<string> Roles { get; set; } = [];

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    [JsonPropertyName("isApproved")]
    public bool IsApproved { get; set; }

    [JsonPropertyName("defaultCommissionRate")]
    public decimal DefaultCommissionRate { get; set; }

    [JsonPropertyName("cDate")]
    public string? CDate { get; set; }

    public string FullName => $"{Name} {Surname}".Trim();
    public string RolesDisplay => string.Join(", ", Roles);
}
