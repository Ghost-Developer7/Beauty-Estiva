using API_BeautyWise.Filters;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API_BeautyWise.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [SubscriptionRequired]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService        _service;
        private readonly UserManager<AppUser>     _userManager;

        public DashboardController(IDashboardService service, UserManager<AppUser> userManager)
        {
            _service     = service;
            _userManager = userManager;
        }

        /// <summary>
        /// Dashboard özet verisi.
        /// Owner/Admin/SuperAdmin → tüm veriler (gelir, gider, tüm grafikler).
        /// Staff → sadece kendi randevuları, kısıtlı istatistikler.
        /// </summary>
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var user  = await _userManager.GetUserAsync(User) ?? throw new Exception("Kullanıcı bulunamadı.");
            var roles = await _userManager.GetRolesAsync(user);

            var isOwnerOrAdmin = roles.Any(r => r == "Owner" || r == "Admin" || r == "SuperAdmin");

            // Staff sadece kendi verilerini görür
            int? staffFilter = isOwnerOrAdmin ? null : user.Id;

            var summary = await _service.GetSummaryAsync(user.TenantId, staffFilter);

            return Ok(ApiResponse<object>.Ok(summary, "Dashboard verisi getirildi."));
        }
    }
}
