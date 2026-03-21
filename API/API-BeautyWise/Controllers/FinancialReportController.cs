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
    public class FinancialReportController : ControllerBase
    {
        private readonly IFinancialReportService _service;
        private readonly UserManager<AppUser>    _userManager;

        public FinancialReportController(IFinancialReportService service, UserManager<AppUser> userManager)
        {
            _service     = service;
            _userManager = userManager;
        }

        // ─── Helpers ──────────────────────────────────────────────────────────────

        private async Task<(AppUser user, bool isOwnerOrAdmin)> GetCurrentUserAsync()
        {
            var user  = await _userManager.GetUserAsync(User) ?? throw new Exception("Kullanıcı bulunamadı.");
            var roles = await _userManager.GetRolesAsync(user);
            return (user, roles.Any(r => r == "Owner" || r == "Admin"));
        }

        private static (DateTime start, DateTime end) ParseDateRange(DateTime? startDate, DateTime? endDate)
        {
            var now   = DateTime.Now;
            var start = startDate ?? new DateTime(now.Year, now.Month, 1);
            var end   = endDate   ?? now;
            return (start, end);
        }

        // ════════════════════════════════════════════════════════════════════════
        //  DASHBOARD
        //  GET /api/financialreport/dashboard?startDate=&endDate=
        // ════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Finansal dashboard (net kâr, gelir, gider, randevu istatistikleri).
        /// Owner/Admin → tüm veriler + gider özeti.
        /// Staff       → sadece kendi randevularına ait gelir; giderler gizli.
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate   = null)
        {
            var (user, isOwnerOrAdmin) = await GetCurrentUserAsync();
            var (start, end)           = ParseDateRange(startDate, endDate);

            // Staff sadece kendi gelirini görür
            int? staffFilter = isOwnerOrAdmin ? null : user.Id;

            var dashboard = await _service.GetDashboardAsync(
                user.TenantId, start, end, staffFilter);

            return Ok(ApiResponse<object>.Ok(dashboard, "Dashboard verisi getirildi."));
        }

        // ════════════════════════════════════════════════════════════════════════
        //  GELİR ÖZETİ
        //  GET /api/financialreport/revenue?startDate=&endDate=&staffId=
        // ════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Gelir özeti. Owner/Admin isteğe bağlı staffId filtresi ekleyebilir.
        /// Staff kendi ID'sine göre otomatik filtrelenir.
        /// </summary>
        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenue(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate   = null,
            [FromQuery] int?      staffId   = null)
        {
            var (user, isOwnerOrAdmin) = await GetCurrentUserAsync();
            var (start, end)           = ParseDateRange(startDate, endDate);

            int? effectiveStaffId = isOwnerOrAdmin ? staffId : user.Id;

            var summary = await _service.GetRevenueSummaryAsync(
                user.TenantId, start, end, effectiveStaffId);

            return Ok(ApiResponse<object>.Ok(summary, "Gelir özeti getirildi."));
        }

        // ════════════════════════════════════════════════════════════════════════
        //  GİDER ÖZETİ
        //  GET /api/financialreport/expense?startDate=&endDate=
        // ════════════════════════════════════════════════════════════════════════

        /// <summary>
        /// Gider özeti — yalnızca Owner ve Admin görebilir.
        /// </summary>
        [HttpGet("expense")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> GetExpense(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate   = null)
        {
            var (user, _) = await GetCurrentUserAsync();
            var (start, end) = ParseDateRange(startDate, endDate);

            var summary = await _service.GetExpenseSummaryAsync(user.TenantId, start, end);

            return Ok(ApiResponse<object>.Ok(summary, "Gider özeti getirildi."));
        }
    }
}
