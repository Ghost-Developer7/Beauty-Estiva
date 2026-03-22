using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Globalization;
using System.Xml.Linq;

namespace API_BeautyWise.Services
{
    public class TcmbExchangeRateService : ITcmbExchangeRateService
    {
        private const string CacheKey = "TCMB_RATES";
        private const string TcmbUrl = "https://www.tcmb.gov.tr/kurlar/today.xml";

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _cache;
        private readonly Context _context;
        private readonly ILogger<TcmbExchangeRateService> _logger;

        public TcmbExchangeRateService(
            IHttpClientFactory httpClientFactory,
            IMemoryCache cache,
            Context context,
            ILogger<TcmbExchangeRateService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _cache = cache;
            _context = context;
            _logger = logger;
        }

        public async Task<decimal?> GetExchangeRateAsync(string currencyCode)
        {
            if (string.IsNullOrWhiteSpace(currencyCode) ||
                currencyCode.Equals("TRY", StringComparison.OrdinalIgnoreCase))
                return 1m;

            var rates = await GetAllRatesAsync();
            var rate = rates.FirstOrDefault(r =>
                r.CurrencyCode.Equals(currencyCode, StringComparison.OrdinalIgnoreCase));

            if (rate != null) return rate.ForexBuying;

            // TCMB'de bulunamadıysa DB cache'e bak
            var dbCurrency = await _context.Currencies
                .FirstOrDefaultAsync(c => c.Code == currencyCode && c.IsActive);
            return dbCurrency?.ExchangeRateToTry;
        }

        public async Task<List<ExchangeRateDto>> GetAllRatesAsync()
        {
            if (_cache.TryGetValue(CacheKey, out List<ExchangeRateDto>? cached) && cached != null)
                return cached;

            var rates = await FetchFromTcmbAsync();

            if (rates.Count > 0)
            {
                _cache.Set(CacheKey, rates, TimeSpan.FromHours(24));
                await PersistRatesToDbAsync(rates);
            }
            else
            {
                // TCMB erişilemezse DB'den oku
                rates = await GetRatesFromDbAsync();
                if (rates.Count > 0)
                    _cache.Set(CacheKey, rates, TimeSpan.FromHours(1)); // kısa süre cache'le
            }

            return rates;
        }

        public async Task RefreshRatesAsync()
        {
            _cache.Remove(CacheKey);
            await GetAllRatesAsync();
        }

        private async Task<List<ExchangeRateDto>> FetchFromTcmbAsync()
        {
            var rates = new List<ExchangeRateDto>();
            try
            {
                var client = _httpClientFactory.CreateClient("TCMB");
                var response = await client.GetStringAsync(TcmbUrl);
                var doc = XDocument.Parse(response);
                var dateAttr = doc.Root?.Attribute("Tarih");
                var rateDate = dateAttr != null
                    ? DateTime.TryParse(dateAttr.Value, CultureInfo.GetCultureInfo("tr-TR"), DateTimeStyles.None, out var d) ? d : DateTime.UtcNow
                    : DateTime.UtcNow;

                var currencies = doc.Descendants("Currency");
                foreach (var curr in currencies)
                {
                    var code = curr.Attribute("Kod")?.Value;
                    if (string.IsNullOrEmpty(code)) continue;

                    var forexBuyingStr = curr.Element("ForexBuying")?.Value;
                    var forexSellingStr = curr.Element("ForexSelling")?.Value;
                    var currName = curr.Element("Isim")?.Value ?? code;

                    if (string.IsNullOrEmpty(forexBuyingStr) || string.IsNullOrEmpty(forexSellingStr))
                        continue;

                    if (decimal.TryParse(forexBuyingStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var buying) &&
                        decimal.TryParse(forexSellingStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var selling))
                    {
                        rates.Add(new ExchangeRateDto
                        {
                            CurrencyCode = code,
                            CurrencyName = currName,
                            ForexBuying = buying,
                            ForexSelling = selling,
                            RateDate = rateDate
                        });
                    }
                }

                _logger.LogInformation("TCMB'den {Count} kur bilgisi çekildi.", rates.Count);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "TCMB kur bilgisi çekilemedi. DB cache kullanılacak.");
            }

            return rates;
        }

        private async Task PersistRatesToDbAsync(List<ExchangeRateDto> rates)
        {
            try
            {
                var currencies = await _context.Currencies
                    .Where(c => c.TcmbCurrencyCode != null && c.IsActive)
                    .ToListAsync();

                foreach (var currency in currencies)
                {
                    var rate = rates.FirstOrDefault(r =>
                        r.CurrencyCode.Equals(currency.TcmbCurrencyCode, StringComparison.OrdinalIgnoreCase));

                    if (rate != null)
                    {
                        currency.ExchangeRateToTry = rate.ForexBuying;
                        currency.RateLastUpdated = DateTime.UtcNow;
                    }
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "TCMB kurları DB'ye kaydedilemedi.");
            }
        }

        private async Task<List<ExchangeRateDto>> GetRatesFromDbAsync()
        {
            var currencies = await _context.Currencies
                .Where(c => c.TcmbCurrencyCode != null && c.ExchangeRateToTry != null && c.IsActive)
                .ToListAsync();

            return currencies.Select(c => new ExchangeRateDto
            {
                CurrencyCode = c.Code,
                CurrencyName = c.Name,
                ForexBuying = c.ExchangeRateToTry!.Value,
                ForexSelling = c.ExchangeRateToTry!.Value,
                RateDate = c.RateLastUpdated ?? DateTime.UtcNow
            }).ToList();
        }
    }
}
