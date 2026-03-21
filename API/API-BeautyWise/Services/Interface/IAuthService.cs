using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IAuthService
    {
        Task<(bool Success, string Message, LoginResultDto? Data)> LoginAsync(LoginRequestDto dto);
        Task<int> RegisterStaffAsync(StaffRegisterDto dto);
    }
}
