using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface INotificationService
    {
        // Tenant settings
        Task<TenantSettingsDto> GetTenantSettingsAsync(int tenantId);
        Task UpdateTenantSettingsAsync(int tenantId, int userId, TenantSettingsUpdateDto dto);

        // Notification rules
        Task<List<NotificationRuleDto>> GetNotificationRulesAsync(int tenantId);
        Task UpdateNotificationRuleAsync(int tenantId, int userId, NotificationRuleUpdateDto dto);

        // WhatsApp integration
        Task<WhatsappIntegrationDto?> GetWhatsappIntegrationAsync(int tenantId);
        Task SaveWhatsappIntegrationAsync(int tenantId, WhatsappIntegrationDto dto);

        // Send reminder
        Task<SendReminderResultDto> SendWhatsappReminderAsync(int tenantId, int appointmentId);
    }
}
