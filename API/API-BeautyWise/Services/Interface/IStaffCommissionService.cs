using API_BeautyWise.DTO;
using API_BeautyWise.Models;

namespace API_BeautyWise.Services.Interface
{
    public interface IStaffCommissionService
    {
        // Komisyon oran yönetimi
        Task<StaffCommissionRateDto> GetStaffCommissionRatesAsync(int tenantId, int staffId);
        Task<AllCommissionRatesDto> GetAllCommissionRatesAsync(int tenantId);
        Task SetStaffCommissionAsync(int tenantId, int staffId, SetStaffCommissionDto dto, int updatedByUserId);

        // Komisyon hesaplama (ödeme oluşturulduğunda çağrılır)
        Task<StaffCommissionRecord> CalculateAndRecordCommissionAsync(
            int tenantId, AppointmentPayment payment, int staffId, int treatmentId, int createdByUserId);

        // Komisyon sorgulama
        Task<List<StaffCommissionRecordDto>> GetCommissionRecordsAsync(
            int tenantId, DateTime? startDate, DateTime? endDate, int? staffId, bool? isPaid);
        Task<List<StaffCommissionSummaryDto>> GetCommissionSummaryAsync(
            int tenantId, DateTime? startDate, DateTime? endDate);
        Task<StaffCommissionSummaryDto?> GetMyCommissionSummaryAsync(
            int tenantId, int staffId, DateTime? startDate, DateTime? endDate);
        Task<StaffCommissionSummaryDto?> GetStaffCommissionHistoryAsync(
            int tenantId, int staffId, DateTime? startDate, DateTime? endDate);

        // Ödeme takibi
        Task MarkCommissionsPaidAsync(int tenantId, List<int> commissionRecordIds, int updatedByUserId);
        Task BulkPayCommissionsAsync(int tenantId, int staffId, int month, int year, int updatedByUserId);
    }
}
