using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace API_BeautyWise.Services
{
    public class SmsService : ISmsService
    {
        private readonly Context _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<SmsService> _logger;

        private const string IletiMerkeziBaseUrl = "https://api.iletimerkezi.com/v1";

        public SmsService(Context context, IHttpClientFactory httpClientFactory, ILogger<SmsService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // ─────────────────────────────────────────────────
        //  Send Single SMS
        // ─────────────────────────────────────────────────
        public async Task<SmsResult> SendSmsAsync(int tenantId, string phoneNumber, string message)
        {
            var integration = await GetIntegrationAsync(tenantId);
            if (integration == null)
                return new SmsResult { Success = false, Message = "SMS entegrasyonu bulunamadı." };

            if (integration.IsActive != true)
                return new SmsResult { Success = false, Message = "SMS entegrasyonu aktif değil." };

            var normalizedPhone = NormalizePhoneNumber(phoneNumber);
            if (string.IsNullOrEmpty(normalizedPhone))
                return new SmsResult { Success = false, Message = "Geçersiz telefon numarası." };

            return await CallIletiMerkeziSendAsync(integration, new List<string> { normalizedPhone }, message);
        }

        // ─────────────────────────────────────────────────
        //  Send Bulk SMS
        // ─────────────────────────────────────────────────
        public async Task<SmsResult> SendBulkSmsAsync(int tenantId, List<string> phoneNumbers, string message)
        {
            var integration = await GetIntegrationAsync(tenantId);
            if (integration == null)
                return new SmsResult { Success = false, Message = "SMS entegrasyonu bulunamadı." };

            if (integration.IsActive != true)
                return new SmsResult { Success = false, Message = "SMS entegrasyonu aktif değil." };

            var normalized = phoneNumbers
                .Select(NormalizePhoneNumber)
                .Where(p => !string.IsNullOrEmpty(p))
                .Distinct()
                .ToList();

            if (!normalized.Any())
                return new SmsResult { Success = false, Message = "Geçerli telefon numarası bulunamadı." };

            return await CallIletiMerkeziSendAsync(integration, normalized!, message);
        }

        // ─────────────────────────────────────────────────
        //  Get Credit Balance
        // ─────────────────────────────────────────────────
        public async Task<SmsCreditResult> GetCreditBalanceAsync(int tenantId)
        {
            var integration = await GetIntegrationAsync(tenantId);
            if (integration == null)
                return new SmsCreditResult { Success = false, Message = "SMS entegrasyonu bulunamadı." };

            try
            {
                var client = _httpClientFactory.CreateClient("IletiMerkezi");

                var requestBody = new
                {
                    request = new
                    {
                        authentication = new
                        {
                            key = integration.SmsApiKey,
                            hash = integration.SmsApiHash
                        }
                    }
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                var response = await client.GetAsync($"{IletiMerkeziBaseUrl}/get-balance");

                // İleti Merkezi GET /get-balance uses query params or POST body
                // Trying POST method for balance as well with auth
                var postResponse = await client.PostAsync($"{IletiMerkeziBaseUrl}/get-balance", content);

                if (postResponse.IsSuccessStatusCode)
                {
                    var responseBody = await postResponse.Content.ReadAsStringAsync();

                    // İleti Merkezi balance response parsing
                    var balanceResult = TryParseBalanceResponse(responseBody);
                    if (balanceResult.HasValue)
                    {
                        // Cache the balance
                        integration.CreditBalance = balanceResult.Value;
                        integration.CreditBalanceUpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();

                        return new SmsCreditResult
                        {
                            Success = true,
                            Balance = balanceResult.Value,
                            Message = "Bakiye başarıyla alındı."
                        };
                    }
                }

                // Return cached balance if API call fails
                return new SmsCreditResult
                {
                    Success = true,
                    Balance = integration.CreditBalance,
                    Message = "Önbellek bakiyesi gösteriliyor."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SMS bakiye sorgulama hatası. TenantId: {TenantId}", tenantId);
                return new SmsCreditResult
                {
                    Success = false,
                    Balance = integration.CreditBalance,
                    Message = "Bakiye sorgulanırken hata oluştu."
                };
            }
        }

        // ─────────────────────────────────────────────────
        //  Save SMS Settings
        // ─────────────────────────────────────────────────
        public async Task<bool> SaveSmsSettingsAsync(int tenantId, SmsSettingsDto dto)
        {
            var integration = await _context.TenantSMSIntegrations
                .FirstOrDefaultAsync(x => x.TenantId == tenantId);

            if (integration == null)
            {
                integration = new TenantSMSIntegration
                {
                    TenantId = tenantId,
                    CDate = DateTime.UtcNow,
                    IsActive = dto.IsActive
                };
                _context.TenantSMSIntegrations.Add(integration);
            }

            integration.SmsProvider = dto.SmsProvider ?? "iletimerkezi";
            integration.SmsApiKey = dto.ApiKey;
            integration.SmsApiHash = dto.ApiHash;
            integration.SmsHeader = dto.SenderTitle;
            integration.IsActive = dto.IsActive;
            integration.UDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // ─────────────────────────────────────────────────
        //  Get SMS Settings
        // ─────────────────────────────────────────────────
        public async Task<SmsSettingsDto?> GetSmsSettingsAsync(int tenantId)
        {
            var integration = await _context.TenantSMSIntegrations
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.TenantId == tenantId);

            if (integration == null)
                return new SmsSettingsDto
                {
                    SmsProvider = "iletimerkezi",
                    IsActive = false,
                    CreditBalance = 0
                };

            return new SmsSettingsDto
            {
                SmsProvider = integration.SmsProvider ?? "iletimerkezi",
                ApiKey = integration.SmsApiKey,
                ApiHash = integration.SmsApiHash,
                SenderTitle = integration.SmsHeader,
                IsActive = integration.IsActive == true,
                CreditBalance = integration.CreditBalance,
                CreditBalanceUpdatedAt = integration.CreditBalanceUpdatedAt
            };
        }

        // ─────────────────────────────────────────────────
        //  Send Appointment Reminder
        // ─────────────────────────────────────────────────
        public async Task<SmsResult> SendAppointmentReminderAsync(int tenantId, int appointmentId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Customer)
                .Include(a => a.Treatment)
                .Include(a => a.Staff)
                .Include(a => a.Tenant)
                .FirstOrDefaultAsync(a => a.Id == appointmentId && a.TenantId == tenantId);

            if (appointment == null)
                return new SmsResult { Success = false, Message = "Randevu bulunamadı." };

            if (string.IsNullOrWhiteSpace(appointment.Customer.Phone))
                return new SmsResult { Success = false, Message = "Müşterinin telefon numarası bulunamadı." };

            // Format reminder message
            var date = appointment.StartTime.ToString("dd.MM.yyyy");
            var time = appointment.StartTime.ToString("HH:mm");
            var customerName = $"{appointment.Customer.Name} {appointment.Customer.Surname}".Trim();
            var treatmentName = appointment.Treatment.Name;
            var salonName = appointment.Tenant.CompanyName ?? "";
            var staffName = $"{appointment.Staff.Name} {appointment.Staff.Surname}".Trim();

            var message = $"Sayın {customerName}, " +
                          $"{date} tarihinde saat {time}'de " +
                          $"{treatmentName} randevunuz bulunmaktadır. " +
                          $"Uzman: {staffName}. " +
                          $"{salonName}";

            return await SendSmsAsync(tenantId, appointment.Customer.Phone, message);
        }

        // ═════════════════════════════════════════════════
        //  Private Helpers
        // ═════════════════════════════════════════════════

        private async Task<TenantSMSIntegration?> GetIntegrationAsync(int tenantId)
        {
            return await _context.TenantSMSIntegrations
                .FirstOrDefaultAsync(x => x.TenantId == tenantId);
        }

        /// <summary>
        /// Telefon numarasını 905xxxxxxxxx formatına dönüştürür.
        /// </summary>
        private string? NormalizePhoneNumber(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return null;

            // Boşluk, tire, parantez, + temizle
            var cleaned = new string(phone.Where(char.IsDigit).ToArray());

            // 05xx → 905xx
            if (cleaned.StartsWith("0") && cleaned.Length == 11)
                cleaned = "9" + cleaned;

            // 5xx → 905xx
            if (cleaned.StartsWith("5") && cleaned.Length == 10)
                cleaned = "90" + cleaned;

            // 905xx kontrol
            if (cleaned.StartsWith("90") && cleaned.Length == 12)
                return cleaned;

            // Zaten uluslararası format
            if (cleaned.Length >= 10 && cleaned.Length <= 15)
                return cleaned;

            return null;
        }

        /// <summary>
        /// İleti Merkezi API'sine SMS gönderim isteği yapar.
        /// </summary>
        private async Task<SmsResult> CallIletiMerkeziSendAsync(
            TenantSMSIntegration integration,
            List<string> phoneNumbers,
            string message)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("IletiMerkezi");

                var requestBody = new
                {
                    request = new
                    {
                        authentication = new
                        {
                            key = integration.SmsApiKey,
                            hash = integration.SmsApiHash
                        },
                        order = new
                        {
                            sender = integration.SmsHeader,
                            sendDateTime = "",
                            message = new
                            {
                                text = message,
                                receipts = new
                                {
                                    number = phoneNumbers
                                }
                            }
                        }
                    }
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                var response = await client.PostAsync($"{IletiMerkeziBaseUrl}/send-sms", content);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var orderId = TryParseOrderId(responseBody);
                    _logger.LogInformation(
                        "SMS gönderildi. TenantId: {TenantId}, Numara sayısı: {Count}, OrderId: {OrderId}",
                        integration.TenantId, phoneNumbers.Count, orderId);

                    return new SmsResult
                    {
                        Success = true,
                        Message = "SMS başarıyla gönderildi.",
                        OrderId = orderId
                    };
                }

                _logger.LogWarning(
                    "SMS gönderilemedi. TenantId: {TenantId}, StatusCode: {StatusCode}, Response: {Response}",
                    integration.TenantId, response.StatusCode, responseBody);

                var errorMessage = TryParseErrorMessage(responseBody);
                return new SmsResult
                {
                    Success = false,
                    Message = errorMessage ?? "SMS gönderilemedi. Lütfen ayarlarınızı kontrol edin."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SMS gönderim hatası. TenantId: {TenantId}", integration.TenantId);
                return new SmsResult
                {
                    Success = false,
                    Message = "SMS gönderilirken bir hata oluştu."
                };
            }
        }

        /// <summary>
        /// İleti Merkezi bakiye yanıtından bakiye değerini çıkarır.
        /// </summary>
        private decimal? TryParseBalanceResponse(string responseBody)
        {
            try
            {
                using var doc = JsonDocument.Parse(responseBody);
                var root = doc.RootElement;

                // İleti Merkezi response: { "response": { "status": { "code": "200" }, "balance": { "sms": "1234", "amount": "56.78" } } }
                if (root.TryGetProperty("response", out var respElement))
                {
                    if (respElement.TryGetProperty("balance", out var balanceElement))
                    {
                        if (balanceElement.TryGetProperty("sms", out var smsElement))
                        {
                            if (decimal.TryParse(smsElement.GetString(), out var smsBalance))
                                return smsBalance;
                        }
                        if (balanceElement.TryGetProperty("amount", out var amountElement))
                        {
                            if (decimal.TryParse(amountElement.GetString(), out var amount))
                                return amount;
                        }
                    }
                }
            }
            catch
            {
                // JSON parse hatası — null döndür
            }

            return null;
        }

        /// <summary>
        /// İleti Merkezi gönderim yanıtından sipariş ID'sini çıkarır.
        /// </summary>
        private string? TryParseOrderId(string responseBody)
        {
            try
            {
                using var doc = JsonDocument.Parse(responseBody);
                var root = doc.RootElement;

                if (root.TryGetProperty("response", out var respElement))
                {
                    if (respElement.TryGetProperty("order", out var orderElement))
                    {
                        if (orderElement.TryGetProperty("id", out var idElement))
                            return idElement.GetString();
                    }
                }
            }
            catch { }

            return null;
        }

        /// <summary>
        /// İleti Merkezi hata yanıtından mesajı çıkarır.
        /// </summary>
        private string? TryParseErrorMessage(string responseBody)
        {
            try
            {
                using var doc = JsonDocument.Parse(responseBody);
                var root = doc.RootElement;

                if (root.TryGetProperty("response", out var respElement))
                {
                    if (respElement.TryGetProperty("status", out var statusElement))
                    {
                        if (statusElement.TryGetProperty("message", out var msgElement))
                            return msgElement.GetString();
                    }
                }
            }
            catch { }

            return null;
        }
    }
}
