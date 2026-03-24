using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IAppointmentPaymentService
    {
        /// <summary>Belirli bir randevuya ait ödeme kayıtları</summary>
        Task<List<AppointmentPaymentListDto>> GetByAppointmentAsync(int appointmentId, int tenantId);

        /// <summary>Filtrelenmiş ödeme listesi. Staff kendi randevularını görür.</summary>
        Task<List<AppointmentPaymentListDto>> GetAllAsync(
            int tenantId,
            DateTime?  startDate   = null,
            DateTime?  endDate     = null,
            int?       staffId     = null,
            int?       customerId  = null);

        /// <summary>Filtrelenmiş sayfalanmış ödeme listesi.</summary>
        Task<PaginatedResponse<AppointmentPaymentListDto>> GetAllPaginatedAsync(
            int tenantId, int pageNumber, int pageSize,
            DateTime?  startDate   = null,
            DateTime?  endDate     = null,
            int?       staffId     = null,
            int?       customerId  = null);

        Task<AppointmentPaymentListDto?> GetByIdAsync(int id, int tenantId);

        Task<int>  CreateAsync(int tenantId, int createdByUserId, AppointmentPaymentCreateDto dto);
        Task       UpdateAsync(int id, int tenantId, AppointmentPaymentUpdateDto dto);
        Task       DeleteAsync(int id, int tenantId);
    }
}
