using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public interface IAppointmentService
{
    Task<ApiResponse<List<AppointmentListItem>>> ListAsync(string? startDate = null, string? endDate = null, int? staffId = null);
    Task<ApiResponse<PaginatedResponse<AppointmentListItem>>> ListPaginatedAsync(int page = 1, int pageSize = 20, string? startDate = null, string? endDate = null);
    Task<ApiResponse<List<AppointmentListItem>>> GetTodayAsync();
    Task<ApiResponse<List<AppointmentListItem>>> CreateAsync(AppointmentCreate data);
    Task<ApiResponse<object>> UpdateStatusAsync(int id, AppointmentStatusUpdate data);
    Task<ApiResponse<object>> CancelAsync(int id);
}
