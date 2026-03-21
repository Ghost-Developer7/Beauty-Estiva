using API_BeautyWise.Models;

namespace API_BeautyWise.Helpers.Interface
{
    public interface IJwtTokenGenerator
    {
        Task<string> GenerateAsync(AppUser user);
    }
}
