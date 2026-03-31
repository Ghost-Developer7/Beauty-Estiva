using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public interface ITreatmentService
{
    Task<ApiResponse<List<TreatmentListItem>>> ListAsync();
    Task<ApiResponse<PaginatedResponse<TreatmentListItem>>> ListPaginatedAsync(int page = 1, int pageSize = 20);
    Task<ApiResponse<object>> CreateAsync(TreatmentCreate data);
    Task<ApiResponse<object>> UpdateAsync(int id, TreatmentCreate data);
    Task<ApiResponse<object>> DeleteAsync(int id);
}
