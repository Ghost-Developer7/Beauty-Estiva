using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API_BeautyWise.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExchangeRateController : ControllerBase
    {
        private readonly ITcmbExchangeRateService _exchangeRateService;

        public ExchangeRateController(ITcmbExchangeRateService exchangeRateService)
        {
            _exchangeRateService = exchangeRateService;
        }

        /// <summary>Tüm güncel kurları getirir (TCMB).</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var rates = await _exchangeRateService.GetAllRatesAsync();
                return Ok(ApiResponse<List<ExchangeRateDto>>.Ok(rates));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>Belirli bir döviz kodu için kuru döner.</summary>
        [HttpGet("{code}")]
        public async Task<IActionResult> GetByCode(string code)
        {
            try
            {
                var rate = await _exchangeRateService.GetExchangeRateAsync(code);
                if (rate == null)
                    return NotFound(ApiResponse<object>.Fail("Bu döviz kodu için kur bulunamadı."));

                return Ok(ApiResponse<decimal>.Ok(rate.Value));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>TCMB'den kurları zorla yeniler. Sadece Owner/Admin.</summary>
        [HttpPost("refresh")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Refresh()
        {
            try
            {
                await _exchangeRateService.RefreshRatesAsync();
                var rates = await _exchangeRateService.GetAllRatesAsync();
                return Ok(ApiResponse<List<ExchangeRateDto>>.Ok(rates));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
