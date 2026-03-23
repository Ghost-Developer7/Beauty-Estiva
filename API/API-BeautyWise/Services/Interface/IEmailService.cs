namespace API_BeautyWise.Services.Interface
{
    public interface IEmailService
    {
        Task SendInviteEmailAsync(string toEmail, string tokenCode, string companyName, string frontendUrl);
    }
}
