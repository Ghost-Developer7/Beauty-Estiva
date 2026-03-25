using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface ICustomerDebtService
    {
        // ─── Borç/Alacak CRUD ────────────────────────────────────────────────────

        Task<PaginatedResponse<CustomerDebtDto>> GetDebtsAsync(
            int tenantId,
            string? type     = null,
            string? status   = null,
            string? search   = null,
            int     page     = 1,
            int     pageSize = 20);

        Task<CustomerDebtDto?> GetDebtByIdAsync(int tenantId, int debtId);

        Task<int> CreateDebtAsync(int tenantId, int userId, CreateCustomerDebtDto dto);

        Task UpdateDebtAsync(int tenantId, int userId, int debtId, UpdateCustomerDebtDto dto);

        Task DeleteDebtAsync(int tenantId, int debtId);

        // ─── Ödeme (Tahsilat) ────────────────────────────────────────────────────

        Task<CustomerDebtPaymentDto> AddPaymentAsync(int tenantId, int userId, int debtId, CreateDebtPaymentDto dto);

        // ─── Özet ────────────────────────────────────────────────────────────────

        Task<CustomerDebtSummaryDto> GetSummaryAsync(int tenantId, string? type = null);

        // ─── Tahsilat Listesi ────────────────────────────────────────────────────

        Task<PaginatedResponse<CollectionListDto>> GetCollectionsAsync(
            int       tenantId,
            DateTime? startDate     = null,
            DateTime? endDate       = null,
            string?   search        = null,
            string?   paymentMethod = null,
            int       page          = 1,
            int       pageSize      = 20);
    }
}
