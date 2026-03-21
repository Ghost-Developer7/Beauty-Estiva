namespace API_BeautyWise.DTO
{
    // Abonelik satın alma isteği
    public class SubscriptionPurchaseDto
    {
        public int SubscriptionPlanId { get; set; }
        public bool IsYearly { get; set; } // true: Yıllık, false: Aylık
        public string? CouponCode { get; set; } // İndirim kodu (opsiyonel)
    }

    // Abonelik satın alma sonucu - PayTR IFRAME bilgisi döner
    public class SubscriptionPurchaseResultDto
    {
        public int SubscriptionId { get; set; }
        public decimal OriginalPrice { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal FinalPrice { get; set; }

        /// <summary>
        /// PayTR IFRAME token. Frontend bu değeri kullanarak iframe embed eder:
        /// <iframe src="https://www.paytr.com/odeme/guvenli/{IframeToken}" />
        /// </summary>
        public string IframeToken { get; set; } = "";

        /// <summary>Hazır iframe URL (IframeToken dahil)</summary>
        public string IframeUrl { get; set; } = "";

        /// <summary>
        /// Sipariş numarası. Ödeme durumu sorgulamak için kullanılabilir.
        /// GET /api/subscription/payment-status/{MerchantOid}
        /// </summary>
        public string MerchantOid { get; set; } = "";

        public bool IsTrialPeriod { get; set; }
    }

    // Mevcut abonelik bilgisi
    public class CurrentSubscriptionDto
    {
        public int Id { get; set; }
        public string PlanName { get; set; } = "";
        public decimal PriceSold { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsTrialPeriod { get; set; }
        public DateTime? TrialEndDate { get; set; }
        public bool AutoRenew { get; set; }
        public string PaymentStatus { get; set; } = "";
        public int DaysRemaining { get; set; }
        public bool IsActive { get; set; }
    }

    // Abonelik iptal isteği
    public class CancelSubscriptionDto
    {
        public string Reason { get; set; } = "";
        public bool RequestRefund { get; set; } // İade talep ediliyor mu?
    }
}
