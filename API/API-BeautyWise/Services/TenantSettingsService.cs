using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class TenantSettingsService : ITenantSettingsService
    {
        private readonly Context _context;

        public TenantSettingsService(Context context)
        {
            _context = context;
        }

        public async Task<TenantFullSettingsDto?> GetFullSettingsAsync(int tenantId)
        {
            var tenant = await _context.Tenants
                .Where(t => t.Id == tenantId && t.IsActive == true)
                .FirstOrDefaultAsync();

            if (tenant == null) return null;

            return new TenantFullSettingsDto
            {
                CompanyName = tenant.CompanyName,
                Phone = tenant.Phone,
                Address = tenant.Address,
                TaxNumber = tenant.TaxNumber,
                TaxOffice = tenant.TaxOffice,
                ReminderHourBefore = tenant.ReminderHourBefore,
                Currency = tenant.Currency,
                Timezone = tenant.Timezone,
                AppointmentSlotMinutes = tenant.AppointmentSlotMinutes,
                AutoConfirmAppointments = tenant.AutoConfirmAppointments,
                BufferMinutes = tenant.BufferMinutes,
                WorkingHoursJson = tenant.WorkingHoursJson,
                HolidaysJson = tenant.HolidaysJson,
            };
        }

        public async Task UpdateProfileAsync(int tenantId, int userId, UpdateTenantProfileDto dto)
        {
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive == true);

            if (tenant == null) throw new Exception("TENANT_NOT_FOUND");

            if (dto.CompanyName != null) tenant.CompanyName = dto.CompanyName;
            if (dto.Phone != null) tenant.Phone = dto.Phone;
            if (dto.Address != null) tenant.Address = dto.Address;
            if (dto.TaxNumber != null) tenant.TaxNumber = dto.TaxNumber;
            if (dto.TaxOffice != null) tenant.TaxOffice = dto.TaxOffice;
            if (dto.Currency != null) tenant.Currency = dto.Currency;
            if (dto.Timezone != null) tenant.Timezone = dto.Timezone;

            tenant.UUser = userId;
            tenant.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        public async Task UpdateWorkingHoursAsync(int tenantId, int userId, UpdateWorkingHoursDto dto)
        {
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive == true);

            if (tenant == null) throw new Exception("TENANT_NOT_FOUND");

            tenant.WorkingHoursJson = dto.WorkingHoursJson;
            tenant.UUser = userId;
            tenant.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        public async Task UpdateHolidaysAsync(int tenantId, int userId, UpdateHolidaysDto dto)
        {
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive == true);

            if (tenant == null) throw new Exception("TENANT_NOT_FOUND");

            tenant.HolidaysJson = dto.HolidaysJson;
            tenant.UUser = userId;
            tenant.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        public async Task UpdateAppointmentSettingsAsync(int tenantId, int userId, UpdateAppointmentSettingsDto dto)
        {
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive == true);

            if (tenant == null) throw new Exception("TENANT_NOT_FOUND");

            tenant.AppointmentSlotMinutes = dto.AppointmentSlotMinutes;
            tenant.AutoConfirmAppointments = dto.AutoConfirmAppointments;
            tenant.BufferMinutes = dto.BufferMinutes;
            tenant.ReminderHourBefore = dto.ReminderHourBefore;
            tenant.UUser = userId;
            tenant.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        public async Task UpdateNotificationSettingsAsync(int tenantId, int userId, UpdateNotificationSettingsDto dto)
        {
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.Id == tenantId && t.IsActive == true);

            if (tenant == null) throw new Exception("TENANT_NOT_FOUND");

            tenant.ReminderHourBefore = dto.ReminderHourBefore;
            tenant.UUser = userId;
            tenant.UDate = DateTime.Now;

            await _context.SaveChangesAsync();

            // Update notification rules for SMS, Email, WhatsApp
            await UpdateNotificationRuleAsync(tenantId, 1, dto.SmsEnabled);      // SMS
            await UpdateNotificationRuleAsync(tenantId, 2, dto.EmailEnabled);     // Email
            await UpdateNotificationRuleAsync(tenantId, 4, dto.WhatsappEnabled);  // WhatsApp
        }

        private async Task UpdateNotificationRuleAsync(int tenantId, int channel, bool isActive)
        {
            var rule = await _context.TenantNotificationRules
                .FirstOrDefaultAsync(r => r.TenantId == tenantId && (int)r.Channel == channel);

            if (rule != null)
            {
                rule.IsActive = isActive;
                await _context.SaveChangesAsync();
            }
        }
    }
}
