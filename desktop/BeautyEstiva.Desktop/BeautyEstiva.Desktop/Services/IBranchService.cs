using BeautyEstiva.Desktop.Models;

namespace BeautyEstiva.Desktop.Services;

public interface IBranchService
{
    Task<ApiResponse<List<BranchListItem>>> ListAsync();
}
