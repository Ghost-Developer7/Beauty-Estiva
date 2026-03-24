using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface ITenantSettingsService
    {
        Task<TenantFullSettingsDto?> GetFullSettingsAsync(int tenantId);
        Task UpdateProfileAsync(int tenantId, int userId, UpdateTenantProfileDto dto);
        Task UpdateWorkingHoursAsync(int tenantId, int userId, UpdateWorkingHoursDto dto);
        Task UpdateHolidaysAsync(int tenantId, int userId, UpdateHolidaysDto dto);
        Task UpdateAppointmentSettingsAsync(int tenantId, int userId, UpdateAppointmentSettingsDto dto);
        Task UpdateNotificationSettingsAsync(int tenantId, int userId, UpdateNotificationSettingsDto dto);
    }
}
