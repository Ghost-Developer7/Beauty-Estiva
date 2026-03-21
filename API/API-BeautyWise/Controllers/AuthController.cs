using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace API_BeautyWise.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(ApiResponse<LoginResultDto>.Ok(result.Data));
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<int>>> Register(StaffRegisterDto dto)
        {//Personel kayıt işlemi (Davet kodu ile)
            var userId = await _authService.RegisterStaffAsync(dto);
            return Ok(ApiResponse<int>.Ok(userId));
        }

    }
}
