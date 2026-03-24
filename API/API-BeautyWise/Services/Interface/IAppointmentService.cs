using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IAppointmentService
    {
        // Listeleme
        Task<List<AppointmentListDto>> GetAllAsync(int tenantId, DateTime? startDate = null, DateTime? endDate = null, int? staffId = null, int? customerId = null);
        Task<PaginatedResponse<AppointmentListDto>> GetAllPaginatedAsync(int tenantId, int pageNumber, int pageSize, DateTime? startDate = null, DateTime? endDate = null, int? staffId = null, int? customerId = null);
        Task<AppointmentDetailDto?> GetByIdAsync(int id, int tenantId);

        // CRUD
        Task<List<AppointmentListDto>> CreateAsync(int tenantId, int createdByUserId, AppointmentCreateDto dto);
        Task<AppointmentListDto> UpdateAsync(int id, int tenantId, AppointmentUpdateDto dto);
        Task<bool> UpdateStatusAsync(int id, int tenantId, AppointmentStatusUpdateDto dto);
        Task<bool> CancelAsync(int id, int tenantId, string? notes = null);

        // Çakışma & Müsaitlik
        Task<AppointmentConflictDto> CheckConflictAsync(int tenantId, int staffId, DateTime startTime, DateTime endTime, int? excludeAppointmentId = null);
        Task<StaffAvailabilityResultDto> GetStaffAvailabilityAsync(int tenantId, StaffAvailabilityRequestDto dto);
    }
}
