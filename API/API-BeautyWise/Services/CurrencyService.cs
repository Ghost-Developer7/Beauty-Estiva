using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    public class CurrencyService : ICurrencyService
    {
        private readonly Context _ctx;

        public CurrencyService(Context ctx) => _ctx = ctx;

        public async Task<List<CurrencyListDto>> GetAllAsync()
        {
            return await _ctx.Currencies
                .Where(c => c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new CurrencyListDto
                {
                    Id           = c.Id,
                    Code         = c.Code,
                    Symbol       = c.Symbol,
                    Name         = c.Name,
                    IsDefault    = c.IsDefault,
                    DisplayOrder = c.DisplayOrder,
                    ExchangeRateToTry = c.ExchangeRateToTry,
                    RateLastUpdated   = c.RateLastUpdated
                })
                .ToListAsync();
        }
    }
}
