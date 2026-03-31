using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public class StaffService : IStaffService
{
    private readonly IApiService _api;

    public StaffService(IApiService api) => _api = api;

    public Task<ApiResponse<List<StaffMember>>> ListAsync()
        => _api.GetAsync<List<StaffMember>>("/staff");

    public Task<ApiResponse<PaginatedResponse<StaffMember>>> ListPaginatedAsync(int page = 1, int pageSize = 20)
    {
        var p = new Dictionary<string, string?>
        {
            ["pageNumber"] = page.ToString(),
            ["pageSize"] = pageSize.ToString()
        };
        return _api.GetAsync<PaginatedResponse<StaffMember>>("/staff", p);
    }

    public Task<ApiResponse<StaffMember>> GetByIdAsync(int id)
        => _api.GetAsync<StaffMember>($"/staff/{id}");
}
