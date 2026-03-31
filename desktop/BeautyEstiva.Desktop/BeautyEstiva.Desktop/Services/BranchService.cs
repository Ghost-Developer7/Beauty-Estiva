using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public class BranchService : IBranchService
{
    private readonly IApiService _api;

    public BranchService(IApiService api) => _api = api;

    public Task<ApiResponse<List<BranchListItem>>> ListAsync()
        => _api.GetAsync<List<BranchListItem>>("/branch");
}
