using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface ISmsService
    {
        Task<SmsResult> SendSmsAsync(int tenantId, string phoneNumber, string message);
        Task<SmsResult> SendBulkSmsAsync(int tenantId, List<string> phoneNumbers, string message);
        Task<SmsCreditResult> GetCreditBalanceAsync(int tenantId);
        Task<bool> SaveSmsSettingsAsync(int tenantId, SmsSettingsDto dto);
        Task<SmsSettingsDto?> GetSmsSettingsAsync(int tenantId);
        Task<SmsResult> SendAppointmentReminderAsync(int tenantId, int appointmentId);
    }
}
