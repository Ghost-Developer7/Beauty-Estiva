using API_BeautyWise.Services.Interface;
using System.Net;
using System.Net.Mail;

namespace API_BeautyWise.Services
{
    public class SmtpSettings
    {
        public string Host { get; set; } = "";
        public int Port { get; set; }
        public string SenderEmail { get; set; } = "";
        public string SenderName { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtp;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _smtp = configuration.GetSection("SmtpSettings").Get<SmtpSettings>() ?? new SmtpSettings();
            _logger = logger;
        }

        public async Task SendInviteEmailAsync(string toEmail, string tokenCode, string companyName, string frontendUrl)
        {
            var registerUrl = $"{frontendUrl}/register?invite={Uri.EscapeDataString(tokenCode)}&email={Uri.EscapeDataString(toEmail)}";

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head><meta charset=""utf-8""></head>
<body style=""margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f0ff;"">
  <div style=""max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"">
    <div style=""background:linear-gradient(135deg,#3b2268,#6c3fa0);padding:32px 24px;text-align:center;"">
      <h1 style=""color:#fff;margin:0;font-size:22px;font-weight:600;"">Beauty Estiva</h1>
      <p style=""color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;"">Personel Davet</p>
    </div>
    <div style=""padding:32px 24px;"">
      <p style=""font-size:15px;color:#333;line-height:1.6;"">
        Merhaba,<br><br>
        <strong>{companyName}</strong> sizi ekibine davet ediyor! Aşağıdaki bağlantıya tıklayarak veya davet kodunu kullanarak kayıt olabilirsiniz.
      </p>
      <div style=""background:#f8f5ff;border:1px solid #e3d8ff;border-radius:12px;padding:20px;margin:24px 0;text-align:center;"">
        <p style=""font-size:12px;color:#6a5c8c;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;"">Davet Kodu</p>
        <p style=""font-size:28px;font-weight:700;color:#3b2268;margin:0;letter-spacing:4px;font-family:monospace;"">{tokenCode}</p>
      </div>
      <div style=""text-align:center;margin:24px 0;"">
        <a href=""{registerUrl}"" style=""display:inline-block;background:#3b2268;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:600;"">
          Kayıt Ol
        </a>
      </div>
      <p style=""font-size:13px;color:#999;text-align:center;"">
        Bu kod 24 saat geçerlidir ve yalnızca bir kez kullanılabilir.
      </p>
    </div>
    <div style=""background:#f9f7fc;padding:16px 24px;text-align:center;border-top:1px solid #ede8f5;"">
      <p style=""font-size:12px;color:#aaa;margin:0;"">Bu e-posta Beauty Estiva tarafından gönderilmiştir.</p>
    </div>
  </div>
</body>
</html>";

            using var client = new SmtpClient(_smtp.Host, _smtp.Port)
            {
                Credentials = new NetworkCredential(_smtp.SenderEmail, _smtp.Password),
                EnableSsl = true
            };

            var message = new MailMessage
            {
                From = new MailAddress(_smtp.SenderEmail, _smtp.SenderName),
                Subject = $"{companyName} - Personel Davet",
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);

            try
            {
                await client.SendMailAsync(message);
                _logger.LogInformation("Invite email sent to {Email} for company {Company}", toEmail, companyName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send invite email to {Email}", toEmail);
                throw;
            }
        }
    }
}
