using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface ICurrencyService
    {
        Task<List<CurrencyListDto>> GetAllAsync();
    }
}
