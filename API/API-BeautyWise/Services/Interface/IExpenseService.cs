using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IExpenseService
    {
        // ─── Kategoriler ──────────────────────────────────────────────────────────

        Task<List<ExpenseCategoryListDto>> GetCategoriesAsync(int tenantId);
        Task<ExpenseCategoryListDto?>      GetCategoryByIdAsync(int id, int tenantId);
        Task<int>                          CreateCategoryAsync(int tenantId, int userId, ExpenseCategoryCreateDto dto);
        Task                               UpdateCategoryAsync(int id, int tenantId, ExpenseCategoryUpdateDto dto);
        Task                               DeleteCategoryAsync(int id, int tenantId);

        // ─── Giderler ─────────────────────────────────────────────────────────────

        Task<List<ExpenseListDto>> GetAllAsync(
            int tenantId,
            DateTime? startDate  = null,
            DateTime? endDate    = null,
            int?      categoryId = null);

        Task<PaginatedResponse<ExpenseListDto>> GetAllPaginatedAsync(
            int tenantId, int pageNumber, int pageSize,
            DateTime? startDate  = null,
            DateTime? endDate    = null,
            int?      categoryId = null);

        Task<ExpenseListDto?> GetByIdAsync(int id, int tenantId);
        Task<int>             CreateAsync(int tenantId, int userId, ExpenseCreateDto dto);
        Task                  UpdateAsync(int id, int tenantId, ExpenseUpdateDto dto);
        Task                  DeleteAsync(int id, int tenantId);
    }
}
