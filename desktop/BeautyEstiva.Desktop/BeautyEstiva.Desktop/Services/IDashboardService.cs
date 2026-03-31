using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public interface IDashboardService
{
    Task<ApiResponse<DashboardSummary>> GetSummaryAsync();
}
