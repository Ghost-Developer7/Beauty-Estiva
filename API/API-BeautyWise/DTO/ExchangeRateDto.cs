namespace API_BeautyWise.DTO
{
    public class ExchangeRateDto
    {
        public string CurrencyCode { get; set; } = "";
        public string CurrencyName { get; set; } = "";
        public decimal ForexBuying { get; set; }
        public decimal ForexSelling { get; set; }
        public DateTime RateDate { get; set; }
    }
}
