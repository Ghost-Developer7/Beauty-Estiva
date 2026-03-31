using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public class DashboardService : IDashboardService
{
    private readonly IApiService _api;

    public DashboardService(IApiService api) => _api = api;

    public Task<ApiResponse<DashboardSummary>> GetSummaryAsync()
        => _api.GetAsync<DashboardSummary>("/dashboard/summary");
}
