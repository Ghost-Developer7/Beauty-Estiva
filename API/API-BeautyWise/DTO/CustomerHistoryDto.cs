namespace API_BeautyWise.DTO
{
    /// <summary>
    /// Müşteri tam ziyaret/satın alma geçmişi
    /// </summary>
    public class CustomerHistoryDto
    {
        public int CustomerId { get; set; }
        public string CustomerFullName { get; set; } = "";
        public List<CustomerTimelineItem> Timeline { get; set; } = new();
    }

    /// <summary>
    /// Müşteri istatistik özeti
    /// </summary>
    public class CustomerStatsDto
    {
        public int CustomerId { get; set; }
        public string CustomerFullName { get; set; } = "";
        public int TotalVisits { get; set; }
        public decimal TotalSpent { get; set; }
        public int LoyaltyPoints { get; set; }
        public DateTime? CustomerSince { get; set; }
        public decimal AverageSpendPerVisit { get; set; }
        public double VisitFrequencyDays { get; set; }          // avg days between visits
        public string Segment { get; set; } = "New";            // New, Regular, VIP, Lost
        public string? PreferredStaffName { get; set; }
        public string? MostUsedTreatment { get; set; }
        public int MostUsedTreatmentCount { get; set; }
        public DateTime? LastVisitDate { get; set; }
        public DateTime? NextAppointmentDate { get; set; }
    }

    /// <summary>
    /// Zaman çizelgesi girişi (randevu, satın alma, not)
    /// </summary>
    public class CustomerTimelineItem
    {
        public int Id { get; set; }
        public string Type { get; set; } = "";   // "appointment", "product_purchase", "package_purchase", "note"
        public DateTime Date { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public string? StaffName { get; set; }
        public decimal? Amount { get; set; }
        public string? Status { get; set; }
        public int? DurationMinutes { get; set; }
    }

    /// <summary>
    /// Sadakat puanı güncelleme isteği
    /// </summary>
    public class UpdateLoyaltyPointsDto
    {
        public int Points { get; set; }
        public string? Reason { get; set; }
    }

    /// <summary>
    /// Müşteri etiketleri güncelleme isteği
    /// </summary>
    public class UpdateCustomerTagsDto
    {
        public List<string> Tags { get; set; } = new();
    }
}
