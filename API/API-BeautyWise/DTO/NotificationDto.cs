namespace API_BeautyWise.DTO
{
    // WhatsApp integration config
    public class WhatsappIntegrationDto
    {
        public string? WhatsappApiToken { get; set; }
        public string? WhatsappInstanceId { get; set; }
    }

    // Notification channel rule
    public class NotificationRuleDto
    {
        public int Id { get; set; }
        public int Channel { get; set; } // 1=SMS, 2=Email, 3=Push, 4=WhatsApp
        public string ChannelName { get; set; } = "";
        public bool IsActive { get; set; }
    }

    public class NotificationRuleUpdateDto
    {
        public int Channel { get; set; }
        public bool IsActive { get; set; }
    }

    // Tenant settings
    public class TenantSettingsDto
    {
        public string CompanyName { get; set; } = "";
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? TaxOffice { get; set; }
        public int ReminderHourBefore { get; set; }
    }

    public class TenantSettingsUpdateDto
    {
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? TaxOffice { get; set; }
        public int? ReminderHourBefore { get; set; }
    }

    // Send WhatsApp reminder manually
    public class SendReminderDto
    {
        public int AppointmentId { get; set; }
    }

    public class SendReminderResultDto
    {
        public bool Sent { get; set; }
        public string? Message { get; set; }
    }
}
