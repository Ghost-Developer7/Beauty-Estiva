using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public class TreatmentService : ITreatmentService
{
    private readonly IApiService _api;

    public TreatmentService(IApiService api) => _api = api;

    public Task<ApiResponse<List<TreatmentListItem>>> ListAsync()
        => _api.GetAsync<List<TreatmentListItem>>("/treatment");

    public Task<ApiResponse<PaginatedResponse<TreatmentListItem>>> ListPaginatedAsync(int page = 1, int pageSize = 20)
    {
        var p = new Dictionary<string, string?>
        {
            ["pageNumber"] = page.ToString(),
            ["pageSize"] = pageSize.ToString()
        };
        return _api.GetAsync<PaginatedResponse<TreatmentListItem>>("/treatment", p);
    }

    public Task<ApiResponse<object>> CreateAsync(TreatmentCreate data)
        => _api.PostAsync<object>("/treatment", data);

    public Task<ApiResponse<object>> UpdateAsync(int id, TreatmentCreate data)
        => _api.PutAsync<object>($"/treatment/{id}", data);

    public Task<ApiResponse<object>> DeleteAsync(int id)
        => _api.DeleteAsync<object>($"/treatment/{id}");
}
