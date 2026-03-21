namespace API_BeautyWise.DTO
{
    // ============================================================
    // PayTR IFRAME Token Alma Sonucu (Adım 1)
    // Frontend bu token'ı alarak iframe oluşturur
    // ============================================================
    public class PaymentInitializeResultDto
    {
        /// <summary>PayTR'dan alınan iframe token. Frontend bunu kullanarak iframe URL'ini oluşturur.</summary>
        public string IframeToken { get; set; } = "";

        /// <summary>Hazır iframe URL: https://www.paytr.com/odeme/guvenli/{IframeToken}</summary>
        public string IframeUrl { get; set; } = "";

        /// <summary>Bizim oluşturduğumuz sipariş ID'si (BW+subscriptionId+timestamp). İade ve durum sorgu için saklanmalı.</summary>
        public string MerchantOid { get; set; } = "";
    }

    // ============================================================
    // PayTR Callback / Bildirim URL'e Gelen Veriler (Adım 2)
    // PayTR sunucudan sunucuya bu verileri POST eder
    // ============================================================
    public class PayTrCallbackDto
    {
        /// <summary>Sipariş numarası (bizim oluşturduğumuz MerchantOid)</summary>
        public string MerchantOid { get; set; } = "";

        /// <summary>Ödeme durumu: "success" veya "failed"</summary>
        public string Status { get; set; } = "";

        /// <summary>Toplam tutar (kuruş cinsinden, örn: 29900 → 299 TL)</summary>
        public string TotalAmount { get; set; } = "";

        /// <summary>Güvenlik hash'i (HMAC-SHA256 ile doğrulanmalı)</summary>
        public string Hash { get; set; } = "";

        /// <summary>Başarısız neden kodu (Status=failed olduğunda)</summary>
        public string? FailedReasonCode { get; set; }

        /// <summary>Başarısız neden mesajı</summary>
        public string? FailedReasonMsg { get; set; }

        /// <summary>Test modu: "1" = test, "0" = gerçek</summary>
        public string? TestMode { get; set; }

        /// <summary>Ödeme tipi: "card", "bank_transfer" vb.</summary>
        public string? PaymentType { get; set; }

        /// <summary>Taksit sayısı</summary>
        public string? InstallmentCount { get; set; }

        /// <summary>Para birimi: "TL", "EUR", "USD"</summary>
        public string? Currency { get; set; }
    }

    // ============================================================
    // Callback İşleme Sonucu (Internal)
    // ============================================================
    public class PaymentCallbackResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public int? SubscriptionId { get; set; }
        public string PaymentStatus { get; set; } = "";
    }

    // ============================================================
    // İade İşlemi Sonucu
    // ============================================================
    public class PaymentRefundResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public string? MerchantOid { get; set; }
        public decimal? RefundAmount { get; set; }

        /// <summary>PayTR'ın verdiği iade referans numarası</summary>
        public string? ReferenceNo { get; set; }

        /// <summary>Test iadesi mi? (PayTR döner)</summary>
        public bool IsTest { get; set; }
    }

    // ============================================================
    // Durum Sorgulama Sonucu
    // ============================================================
    public class PaymentStatusResultDto
    {
        public bool Success { get; set; }
        public string MerchantOid { get; set; } = "";

        /// <summary>Ödeme tutarı (TL)</summary>
        public decimal? PaymentAmount { get; set; }

        /// <summary>Müşterinin gerçekte ödediği tutar (TL) - taksit farkı olabilir</summary>
        public decimal? CustomerPaymentTotal { get; set; }

        public string? Currency { get; set; }
        public string? ErrorMessage { get; set; }
        public string? ErrorNo { get; set; }

        /// <summary>İade listesi</summary>
        public List<PaymentReturnItemDto> Returns { get; set; } = new();
    }

    public class PaymentReturnItemDto
    {
        public decimal Amount { get; set; }
        public string? Date { get; set; }
        public string? Type { get; set; }
        public string? DateCompleted { get; set; }
        public string? AuthCode { get; set; }
        public string? RefNum { get; set; }
    }

    // ============================================================
    // Ödeme Geçmişi DTO (Listeleme için)
    // ============================================================
    public class PaymentHistoryDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string PaymentStatus { get; set; } = "";
        public string? PaymentMethod { get; set; }
        public string Description { get; set; } = "";
        public string? MerchantOid { get; set; }
        public bool IsRefunded { get; set; }
        public decimal? RefundAmount { get; set; }
        public DateTime? RefundDate { get; set; }
        public string? RefundReason { get; set; }
    }
}
