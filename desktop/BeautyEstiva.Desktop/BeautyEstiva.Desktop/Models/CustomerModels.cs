using System.Text.Json.Serialization;

namespace BeautyEstiva.Desktop.Models;

public class CustomerListItem
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("surname")]
    public string Surname { get; set; } = string.Empty;

    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("totalAppointments")]
    public int TotalAppointments { get; set; }

    [JsonPropertyName("lastAppointmentDate")]
    public string? LastAppointmentDate { get; set; }

    [JsonPropertyName("loyaltyPoints")]
    public int LoyaltyPoints { get; set; }

    [JsonPropertyName("totalSpent")]
    public decimal TotalSpent { get; set; }

    [JsonPropertyName("totalVisits")]
    public int TotalVisits { get; set; }

    [JsonPropertyName("segment")]
    public string Segment { get; set; } = string.Empty;

    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; } = [];

    [JsonPropertyName("customerSince")]
    public string? CustomerSince { get; set; }
}

public class CustomerCreate
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("surname")]
    public string Surname { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("birthDate")]
    public string? BirthDate { get; set; }

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [JsonPropertyName("allergies")]
    public string? Allergies { get; set; }

    [JsonPropertyName("preferences")]
    public string? Preferences { get; set; }

    [JsonPropertyName("referralSource")]
    public string? ReferralSource { get; set; }

    [JsonPropertyName("preferredStaffId")]
    public int? PreferredStaffId { get; set; }

    [JsonPropertyName("tags")]
    public List<string>? Tags { get; set; }
}

public class CustomerDetail
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("surname")]
    public string Surname { get; set; } = string.Empty;

    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("birthDate")]
    public string? BirthDate { get; set; }

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [JsonPropertyName("totalAppointments")]
    public int TotalAppointments { get; set; }

    [JsonPropertyName("loyaltyPoints")]
    public int LoyaltyPoints { get; set; }

    [JsonPropertyName("totalSpent")]
    public decimal TotalSpent { get; set; }

    [JsonPropertyName("totalVisits")]
    public int TotalVisits { get; set; }

    [JsonPropertyName("lastVisitDate")]
    public string? LastVisitDate { get; set; }

    [JsonPropertyName("customerSince")]
    public string? CustomerSince { get; set; }

    [JsonPropertyName("preferredStaffName")]
    public string? PreferredStaffName { get; set; }

    [JsonPropertyName("allergies")]
    public string? Allergies { get; set; }

    [JsonPropertyName("preferences")]
    public string? Preferences { get; set; }

    [JsonPropertyName("tags")]
    public List<string> Tags { get; set; } = [];

    [JsonPropertyName("segment")]
    public string Segment { get; set; } = string.Empty;

    [JsonPropertyName("averageSpendPerVisit")]
    public decimal AverageSpendPerVisit { get; set; }
}
