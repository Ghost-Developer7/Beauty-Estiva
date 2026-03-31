using System.Text.Json.Serialization;

namespace BeautyEstiva.Desktop.Models;

public class AppointmentListItem
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("customerId")]
    public int CustomerId { get; set; }

    [JsonPropertyName("customerFullName")]
    public string CustomerFullName { get; set; } = string.Empty;

    [JsonPropertyName("customerPhone")]
    public string CustomerPhone { get; set; } = string.Empty;

    [JsonPropertyName("staffId")]
    public int StaffId { get; set; }

    [JsonPropertyName("staffFullName")]
    public string StaffFullName { get; set; } = string.Empty;

    [JsonPropertyName("treatmentId")]
    public int TreatmentId { get; set; }

    [JsonPropertyName("treatmentName")]
    public string TreatmentName { get; set; } = string.Empty;

    [JsonPropertyName("treatmentColor")]
    public string? TreatmentColor { get; set; }

    [JsonPropertyName("durationMinutes")]
    public int DurationMinutes { get; set; }

    [JsonPropertyName("startTime")]
    public string StartTime { get; set; } = string.Empty;

    [JsonPropertyName("endTime")]
    public string EndTime { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [JsonPropertyName("isRecurring")]
    public bool IsRecurring { get; set; }

    [JsonPropertyName("sessionNumber")]
    public int SessionNumber { get; set; }

    [JsonPropertyName("totalSessions")]
    public int? TotalSessions { get; set; }
}

public class AppointmentCreate
{
    [JsonPropertyName("customerId")]
    public int CustomerId { get; set; }

    [JsonPropertyName("staffId")]
    public int StaffId { get; set; }

    [JsonPropertyName("treatmentId")]
    public int TreatmentId { get; set; }

    [JsonPropertyName("startTime")]
    public string StartTime { get; set; } = string.Empty;

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }

    [JsonPropertyName("isRecurring")]
    public bool IsRecurring { get; set; }

    [JsonPropertyName("recurrenceIntervalDays")]
    public int? RecurrenceIntervalDays { get; set; }

    [JsonPropertyName("totalSessions")]
    public int? TotalSessions { get; set; }
}

public class AppointmentStatusUpdate
{
    [JsonPropertyName("status")]
    public int Status { get; set; }

    [JsonPropertyName("notes")]
    public string? Notes { get; set; }
}
