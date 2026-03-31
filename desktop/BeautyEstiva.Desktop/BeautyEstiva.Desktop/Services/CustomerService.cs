using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public class CustomerService : ICustomerService
{
    private readonly IApiService _api;

    public CustomerService(IApiService api) => _api = api;

    public Task<ApiResponse<List<CustomerListItem>>> ListAsync(string? search = null)
    {
        var p = new Dictionary<string, string?>();
        if (!string.IsNullOrEmpty(search)) p["search"] = search;
        return _api.GetAsync<List<CustomerListItem>>("/customer", p);
    }

    public Task<ApiResponse<PaginatedResponse<CustomerListItem>>> ListPaginatedAsync(int page = 1, int pageSize = 20, string? search = null)
    {
        var p = new Dictionary<string, string?>
        {
            ["pageNumber"] = page.ToString(),
            ["pageSize"] = pageSize.ToString()
        };
        if (!string.IsNullOrEmpty(search)) p["search"] = search;
        return _api.GetAsync<PaginatedResponse<CustomerListItem>>("/customer", p);
    }

    public Task<ApiResponse<CustomerDetail>> GetByIdAsync(int id)
        => _api.GetAsync<CustomerDetail>($"/customer/{id}");

    public Task<ApiResponse<object>> CreateAsync(CustomerCreate data)
        => _api.PostAsync<object>("/customer", data);

    public Task<ApiResponse<object>> UpdateAsync(int id, CustomerCreate data)
        => _api.PutAsync<object>($"/customer/{id}", data);

    public Task<ApiResponse<object>> DeleteAsync(int id)
        => _api.DeleteAsync<object>($"/customer/{id}");
}
