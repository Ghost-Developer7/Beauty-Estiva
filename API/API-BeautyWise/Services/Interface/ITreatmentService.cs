using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface ITreatmentService
    {
        Task<List<TreatmentListDto>> GetAllAsync(int tenantId);
        Task<PaginatedResponse<TreatmentListDto>> GetAllPaginatedAsync(int tenantId, int pageNumber, int pageSize);
        Task<TreatmentListDto?> GetByIdAsync(int id, int tenantId);
        Task<int> CreateAsync(int tenantId, TreatmentCreateDto dto);
        Task<bool> UpdateAsync(int id, int tenantId, TreatmentUpdateDto dto);
        Task<bool> DeleteAsync(int id, int tenantId);
    }
}
