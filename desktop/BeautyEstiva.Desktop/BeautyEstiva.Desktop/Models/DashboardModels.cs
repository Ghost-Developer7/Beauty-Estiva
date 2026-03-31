using System.Text.Json.Serialization;

namespace BeautyEstiva.Desktop.Models;

public class DashboardSummary
{
    [JsonPropertyName("todayAppointmentsCount")]
    public int TodayAppointmentsCount { get; set; }

    [JsonPropertyName("upcomingAppointments")]
    public int UpcomingAppointments { get; set; }

    [JsonPropertyName("thisWeekRevenue")]
    public decimal ThisWeekRevenue { get; set; }

    [JsonPropertyName("thisMonthRevenue")]
    public decimal ThisMonthRevenue { get; set; }

    [JsonPropertyName("thisMonthExpense")]
    public decimal ThisMonthExpense { get; set; }

    [JsonPropertyName("totalCustomers")]
    public int TotalCustomers { get; set; }

    [JsonPropertyName("activePackages")]
    public int ActivePackages { get; set; }

    [JsonPropertyName("monthlyTrend")]
    public List<MonthlyTrend> MonthlyTrend { get; set; } = [];

    [JsonPropertyName("topServices")]
    public List<RevenueByGroup> TopServices { get; set; } = [];

    [JsonPropertyName("topStaff")]
    public List<RevenueByGroup> TopStaff { get; set; } = [];

    [JsonPropertyName("customerGrowth")]
    public List<CustomerGrowth> CustomerGrowth { get; set; } = [];

    [JsonPropertyName("statusDistribution")]
    public AppointmentStatusDistribution? StatusDistribution { get; set; }

    [JsonPropertyName("todaySchedule")]
    public List<TodayAppointment> TodaySchedule { get; set; } = [];
}

public class MonthlyTrend
{
    [JsonPropertyName("month")]
    public string Month { get; set; } = string.Empty;

    [JsonPropertyName("revenue")]
    public decimal Revenue { get; set; }

    [JsonPropertyName("expense")]
    public decimal Expense { get; set; }
}

public class RevenueByGroup
{
    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("count")]
    public int Count { get; set; }

    [JsonPropertyName("amountInTry")]
    public decimal AmountInTry { get; set; }
}

public class CustomerGrowth
{
    [JsonPropertyName("month")]
    public string Month { get; set; } = string.Empty;

    [JsonPropertyName("newCustomers")]
    public int NewCustomers { get; set; }

    [JsonPropertyName("totalCustomers")]
    public int TotalCustomers { get; set; }
}

public class AppointmentStatusDistribution
{
    [JsonPropertyName("scheduled")]
    public int Scheduled { get; set; }

    [JsonPropertyName("confirmed")]
    public int Confirmed { get; set; }

    [JsonPropertyName("completed")]
    public int Completed { get; set; }

    [JsonPropertyName("cancelled")]
    public int Cancelled { get; set; }

    [JsonPropertyName("noShow")]
    public int NoShow { get; set; }

    [JsonPropertyName("total")]
    public int Total { get; set; }
}

public class TodayAppointment
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("time")]
    public string Time { get; set; } = string.Empty;

    [JsonPropertyName("customerName")]
    public string CustomerName { get; set; } = string.Empty;

    [JsonPropertyName("treatmentName")]
    public string TreatmentName { get; set; } = string.Empty;

    [JsonPropertyName("staffName")]
    public string StaffName { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;

    [JsonPropertyName("treatmentColor")]
    public string? TreatmentColor { get; set; }
}

public class BranchListItem
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("address")]
    public string? Address { get; set; }

    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("isMainBranch")]
    public bool IsMainBranch { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    [JsonPropertyName("staffCount")]
    public int StaffCount { get; set; }
}
