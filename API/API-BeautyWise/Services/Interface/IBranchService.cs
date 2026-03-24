using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IBranchService
    {
        Task<List<BranchListDto>> GetBranchesAsync(int tenantId);
        Task<BranchDetailDto?> GetBranchByIdAsync(int tenantId, int branchId);
        Task<BranchListDto> CreateBranchAsync(int tenantId, CreateBranchDto dto, int userId);
        Task<BranchListDto?> UpdateBranchAsync(int tenantId, int branchId, UpdateBranchDto dto, int userId);
        Task<bool> DeactivateBranchAsync(int tenantId, int branchId, int userId);
        Task<bool> AssignStaffAsync(int tenantId, int branchId, int staffId, int userId);
        Task<bool> RemoveStaffAsync(int tenantId, int branchId, int staffId, int userId);
        Task<BranchLimitDto> GetBranchLimitAsync(int tenantId);
        Task CreateMainBranchForTenantAsync(int tenantId, string companyName, int userId);
    }
}
