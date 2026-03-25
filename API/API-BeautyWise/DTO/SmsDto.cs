namespace API_BeautyWise.DTO
{
    // ─── Send Single SMS ───
    public class SendSmsDto
    {
        public string PhoneNumber { get; set; } = "";
        public string Message { get; set; } = "";
    }

    // ─── Send Bulk SMS ───
    public class SendBulkSmsDto
    {
        public List<string> PhoneNumbers { get; set; } = new();
        public string Message { get; set; } = "";
    }

    // ─── SMS Send Result ───
    public class SmsResult
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? OrderId { get; set; } // İleti Merkezi sipariş ID'si
    }

    // ─── Credit Balance ───
    public class SmsCreditResult
    {
        public bool Success { get; set; }
        public decimal Balance { get; set; }
        public string? Message { get; set; }
    }

    // ─── SMS Settings (save/get) ───
    public class SmsSettingsDto
    {
        public string? SmsProvider { get; set; }
        public string? ApiKey { get; set; }
        public string? ApiHash { get; set; }
        public string? SenderTitle { get; set; }
        public bool IsActive { get; set; }
        public decimal CreditBalance { get; set; }
        public DateTime? CreditBalanceUpdatedAt { get; set; }
    }

    // ─── Test SMS ───
    public class TestSmsDto
    {
        public string PhoneNumber { get; set; } = "";
    }
}
