using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IStaffScheduleService
    {
        // Personelin kapalı aralıkları
        Task<List<StaffUnavailabilityListDto>> GetUnavailabilitiesAsync(int tenantId, int staffId, DateTime? startDate = null, DateTime? endDate = null);
        Task<StaffUnavailabilityListDto?> GetUnavailabilityByIdAsync(int id, int tenantId);
        Task<int> CreateUnavailabilityAsync(int tenantId, int staffId, StaffUnavailabilityCreateDto dto);
        Task<bool> UpdateUnavailabilityAsync(int id, int tenantId, int staffId, StaffUnavailabilityUpdateDto dto);
        Task<bool> DeleteUnavailabilityAsync(int id, int tenantId, int staffId);

        // Günlük program (randevu + kapalı aralıklar)
        Task<StaffDailyScheduleDto> GetDailyScheduleAsync(int tenantId, int staffId, DateTime date);
    }
}
