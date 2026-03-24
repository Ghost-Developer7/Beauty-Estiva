using System.ComponentModel.DataAnnotations;

namespace API_BeautyWise.DTO
{
    // Full settings response
    public class TenantFullSettingsDto
    {
        public string CompanyName { get; set; } = "";
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? TaxOffice { get; set; }
        public int ReminderHourBefore { get; set; }
        public string Currency { get; set; } = "TRY";
        public string Timezone { get; set; } = "Europe/Istanbul";
        public int AppointmentSlotMinutes { get; set; }
        public bool AutoConfirmAppointments { get; set; }
        public int BufferMinutes { get; set; }
        public string? WorkingHoursJson { get; set; }
        public string? HolidaysJson { get; set; }
    }

    // Update salon profile
    public class UpdateTenantProfileDto
    {
        [MaxLength(250)]
        public string? CompanyName { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        [MaxLength(20)]
        public string? TaxNumber { get; set; }
        [MaxLength(100)]
        public string? TaxOffice { get; set; }
        [MaxLength(10)]
        public string? Currency { get; set; }
        [MaxLength(50)]
        public string? Timezone { get; set; }
    }

    // Update working hours
    public class UpdateWorkingHoursDto
    {
        public string WorkingHoursJson { get; set; } = "[]";
    }

    // Update holidays
    public class UpdateHolidaysDto
    {
        public string HolidaysJson { get; set; } = "[]";
    }

    // Update appointment settings
    public class UpdateAppointmentSettingsDto
    {
        public int AppointmentSlotMinutes { get; set; } = 30;
        public bool AutoConfirmAppointments { get; set; } = false;
        public int BufferMinutes { get; set; } = 0;
        public int ReminderHourBefore { get; set; } = 24;
    }

    // Update notification settings
    public class UpdateNotificationSettingsDto
    {
        public bool SmsEnabled { get; set; }
        public bool EmailEnabled { get; set; }
        public bool WhatsappEnabled { get; set; }
        public int ReminderHourBefore { get; set; } = 24;
    }
}
