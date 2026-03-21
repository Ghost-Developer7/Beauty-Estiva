namespace API_BeautyWise.DTO
{
    // Kupon oluşturma/güncelleme
    public class CouponDto
    {
        public string Code { get; set; }
        public string? Description { get; set; }
        public bool IsPercentage { get; set; } // true: Yüzde, false: Sabit tutar
        public decimal DiscountAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? MaxUsageCount { get; set; } // null: Sınırsız
        public bool IsGlobal { get; set; } // true: Herkes, false: Belirli tenant
        public int? SpecificTenantId { get; set; }
    }

    // Kupon doğrulama sonucu
    public class CouponValidationResultDto
    {
        public bool IsValid { get; set; }
        public string Message { get; set; }
        public decimal? DiscountAmount { get; set; }
        public bool IsPercentage { get; set; }
    }
}
