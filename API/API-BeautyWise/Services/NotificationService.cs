using API_BeautyWise.DTO;
using API_BeautyWise.Enums;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class NotificationService : INotificationService
    {
        private readonly Context _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public NotificationService(Context context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        // ─── Tenant Settings ───
        public async Task<TenantSettingsDto> GetTenantSettingsAsync(int tenantId)
        {
            var tenant = await _context.Tenants.FindAsync(tenantId)
                ?? throw new Exception("Tenant bulunamadı.");

            return new TenantSettingsDto
            {
                CompanyName = tenant.CompanyName,
                Phone = tenant.Phone,
                Address = tenant.Address,
                TaxNumber = tenant.TaxNumber,
                TaxOffice = tenant.TaxOffice,
                ReminderHourBefore = tenant.ReminderHourBefore
            };
        }

        public async Task UpdateTenantSettingsAsync(int tenantId, int userId, TenantSettingsUpdateDto dto)
        {
            var tenant = await _context.Tenants.FindAsync(tenantId)
                ?? throw new Exception("Tenant bulunamadı.");

            if (dto.Phone != null) tenant.Phone = dto.Phone;
            if (dto.Address != null) tenant.Address = dto.Address;
            if (dto.TaxNumber != null) tenant.TaxNumber = dto.TaxNumber;
            if (dto.TaxOffice != null) tenant.TaxOffice = dto.TaxOffice;
            if (dto.ReminderHourBefore.HasValue) tenant.ReminderHourBefore = dto.ReminderHourBefore.Value;

            tenant.UUser = userId;
            tenant.UDate = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        // ─── Notification Rules ───
        public async Task<List<NotificationRuleDto>> GetNotificationRulesAsync(int tenantId)
        {
            var rules = await _context.TenantNotificationRules
                .Where(r => r.TenantId == tenantId)
                .ToListAsync();

            // Ensure all 4 channels exist
            var channelNames = new Dictionary<int, string>
            {
                { 1, "SMS" }, { 2, "Email" }, { 3, "Push Notification" }, { 4, "WhatsApp" }
            };

            var result = new List<NotificationRuleDto>();
            foreach (var kv in channelNames)
            {
                var existing = rules.FirstOrDefault(r => (int)r.Channel == kv.Key);
                result.Add(new NotificationRuleDto
                {
                    Id = existing?.Id ?? 0,
                    Channel = kv.Key,
                    ChannelName = kv.Value,
                    IsActive = existing?.IsActive ?? false
                });
            }
            return result;
        }

        public async Task UpdateNotificationRuleAsync(int tenantId, int userId, NotificationRuleUpdateDto dto)
        {
            var channel = (NotificationChannel)dto.Channel;
            var rule = await _context.TenantNotificationRules
                .FirstOrDefaultAsync(r => r.TenantId == tenantId && r.Channel == channel);

            bool oldValue = rule?.IsActive ?? false;

            if (rule == null)
            {
                rule = new TenantNotificationRule
                {
                    TenantId = tenantId,
                    Channel = channel,
                    IsActive = dto.IsActive
                };
                _context.TenantNotificationRules.Add(rule);
            }
            else
            {
                rule.IsActive = dto.IsActive;
            }

            // Audit log
            _context.TenantNotificationHistories.Add(new TenantNotificationHistory
            {
                TenantId = tenantId,
                ChangedByUserId = userId,
                Channel = channel,
                OldValue = oldValue,
                NewValue = dto.IsActive,
                ChangeDate = DateTime.Now
            });

            await _context.SaveChangesAsync();
        }

        // ─── WhatsApp Integration ───
        public async Task<WhatsappIntegrationDto?> GetWhatsappIntegrationAsync(int tenantId)
        {
            var integration = await _context.TenantWhatsappIntegrations
                .FirstOrDefaultAsync(w => w.TenantId == tenantId);

            if (integration == null) return null;

            return new WhatsappIntegrationDto
            {
                WhatsappApiToken = integration.WhatsappApiToken,
                WhatsappInstanceId = integration.WhatsappInstanceId
            };
        }

        public async Task SaveWhatsappIntegrationAsync(int tenantId, WhatsappIntegrationDto dto)
        {
            var existing = await _context.TenantWhatsappIntegrations
                .FirstOrDefaultAsync(w => w.TenantId == tenantId);

            if (existing == null)
            {
                existing = new TenantWhatsappIntegration
                {
                    TenantId = tenantId,
                    WhatsappApiToken = dto.WhatsappApiToken,
                    WhatsappInstanceId = dto.WhatsappInstanceId
                };
                _context.TenantWhatsappIntegrations.Add(existing);
            }
            else
            {
                existing.WhatsappApiToken = dto.WhatsappApiToken;
                existing.WhatsappInstanceId = dto.WhatsappInstanceId;
            }

            await _context.SaveChangesAsync();
        }

        // ─── Send WhatsApp Reminder ───
        public async Task<SendReminderResultDto> SendWhatsappReminderAsync(int tenantId, int appointmentId)
        {
            // Check WhatsApp channel is active
            var rule = await _context.TenantNotificationRules
                .FirstOrDefaultAsync(r => r.TenantId == tenantId && r.Channel == NotificationChannel.Whatsapp);

            if (rule == null || !rule.IsActive)
                return new SendReminderResultDto { Sent = false, Message = "WhatsApp kanalı aktif değil." };

            // Get WhatsApp credentials
            var integration = await _context.TenantWhatsappIntegrations
                .FirstOrDefaultAsync(w => w.TenantId == tenantId);

            if (integration == null || string.IsNullOrEmpty(integration.WhatsappApiToken))
                return new SendReminderResultDto { Sent = false, Message = "WhatsApp entegrasyonu yapılandırılmamış." };

            // Get appointment with customer
            var appointment = await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Treatment)
                .FirstOrDefaultAsync(a => a.Id == appointmentId && a.Customer!.TenantId == tenantId);

            if (appointment == null)
                return new SendReminderResultDto { Sent = false, Message = "Randevu bulunamadı." };

            var customer = appointment.Customer!;
            if (string.IsNullOrEmpty(customer.Phone))
                return new SendReminderResultDto { Sent = false, Message = "Müşterinin telefon numarası yok." };

            // Build message
            var tenant = await _context.Tenants.FindAsync(tenantId);
            var treatmentName = appointment.Treatment?.Name ?? "Randevu";
            var dateStr = appointment.StartTime.ToString("dd.MM.yyyy HH:mm");

            var message = $"Merhaba {customer.Name} {customer.Surname}, " +
                          $"{tenant?.CompanyName ?? "Salonumuz"} olarak {dateStr} tarihli " +
                          $"\"{treatmentName}\" randevunuzu hatırlatmak isteriz. " +
                          $"Sizi bekliyoruz!";

            // Send via WhatsApp API (generic WhatsApp Business API call)
            try
            {
                var phone = customer.Phone.Replace(" ", "").Replace("+", "");
                var client = _httpClientFactory.CreateClient();

                // WhatsApp Business API - generic endpoint
                // This supports multiple providers (WABA, UltraMsg, ChatAPI, etc.)
                var requestBody = new
                {
                    token = integration.WhatsappApiToken,
                    to = phone,
                    body = message
                };

                // Using instance-based WhatsApp API
                var apiUrl = $"https://api.ultramsg.com/{integration.WhatsappInstanceId}/messages/chat";

                var response = await client.PostAsJsonAsync(apiUrl, requestBody);

                if (response.IsSuccessStatusCode)
                {
                    return new SendReminderResultDto
                    {
                        Sent = true,
                        Message = $"WhatsApp mesajı gönderildi: {customer.Phone}"
                    };
                }
                else
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    return new SendReminderResultDto
                    {
                        Sent = false,
                        Message = $"WhatsApp API hatası: {errorBody}"
                    };
                }
            }
            catch (Exception ex)
            {
                return new SendReminderResultDto
                {
                    Sent = false,
                    Message = $"WhatsApp gönderim hatası: {ex.Message}"
                };
            }
        }
    }
}
