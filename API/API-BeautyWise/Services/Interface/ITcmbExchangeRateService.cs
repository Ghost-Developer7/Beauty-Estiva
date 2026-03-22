using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface ITcmbExchangeRateService
    {
        /// <summary>Belirli bir döviz kodu için kuru döner (TRY karşılığı). TRY için 1 döner.</summary>
        Task<decimal?> GetExchangeRateAsync(string currencyCode);

        /// <summary>TCMB'den tüm kurları çeker (cache'li).</summary>
        Task<List<ExchangeRateDto>> GetAllRatesAsync();

        /// <summary>Cache'i temizleyip TCMB'den zorla yeniden çeker.</summary>
        Task RefreshRatesAsync();
    }
}
