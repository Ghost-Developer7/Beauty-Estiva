using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IApiService _api;

    public AppointmentService(IApiService api) => _api = api;

    public Task<ApiResponse<List<AppointmentListItem>>> ListAsync(string? startDate = null, string? endDate = null, int? staffId = null)
    {
        var p = new Dictionary<string, string?>();
        if (!string.IsNullOrEmpty(startDate)) p["startDate"] = startDate;
        if (!string.IsNullOrEmpty(endDate)) p["endDate"] = endDate;
        if (staffId.HasValue) p["staffId"] = staffId.Value.ToString();
        return _api.GetAsync<List<AppointmentListItem>>("/appointment", p);
    }

    public Task<ApiResponse<PaginatedResponse<AppointmentListItem>>> ListPaginatedAsync(int page = 1, int pageSize = 20, string? startDate = null, string? endDate = null)
    {
        var p = new Dictionary<string, string?>
        {
            ["pageNumber"] = page.ToString(),
            ["pageSize"] = pageSize.ToString()
        };
        if (!string.IsNullOrEmpty(startDate)) p["startDate"] = startDate;
        if (!string.IsNullOrEmpty(endDate)) p["endDate"] = endDate;
        return _api.GetAsync<PaginatedResponse<AppointmentListItem>>("/appointment", p);
    }

    public Task<ApiResponse<List<AppointmentListItem>>> GetTodayAsync()
        => _api.GetAsync<List<AppointmentListItem>>("/appointment/today");

    public Task<ApiResponse<List<AppointmentListItem>>> CreateAsync(AppointmentCreate data)
        => _api.PostAsync<List<AppointmentListItem>>("/appointment", data);

    public Task<ApiResponse<object>> UpdateStatusAsync(int id, AppointmentStatusUpdate data)
        => _api.PatchAsync<object>($"/appointment/{id}/status", data);

    public Task<ApiResponse<object>> CancelAsync(int id)
        => _api.DeleteAsync<object>($"/appointment/{id}");
}
