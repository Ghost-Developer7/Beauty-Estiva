using API_BeautyWise.Filters;
using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API_BeautyWise.Controllers
{
    /// <summary>
    /// Müşteri borç/alacak ve tahsilat yönetimi.
    /// </summary>
    [Authorize(Roles = "Owner,Admin")]
    [ApiController]
    [Route("api/[controller]")]
    [SubscriptionRequired]
    public class CustomerDebtController : ControllerBase
    {
        private readonly ICustomerDebtService   _service;
        private readonly UserManager<AppUser>   _userManager;

        public CustomerDebtController(ICustomerDebtService service, UserManager<AppUser> userManager)
        {
            _service     = service;
            _userManager = userManager;
        }

        private async Task<AppUser> GetUserAsync() =>
            await _userManager.GetUserAsync(User) ?? throw new Exception("Kullanıcı bulunamadı.");

        // ════════════════════════════════════════════════════════════════════════
        //  BORÇ / ALACAK CRUD
        // ════════════════════════════════════════════════════════════════════════

        /// <summary>GET /api/customerdebt?type=Receivable&amp;status=Pending&amp;search=&amp;page=1&amp;pageSize=20</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? type     = null,
            [FromQuery] string? status   = null,
            [FromQuery] string? search   = null,
            [FromQuery] int     page     = 1,
            [FromQuery] int     pageSize = 20)
        {
            var user   = await GetUserAsync();
            var result = await _service.GetDebtsAsync(user.TenantId, type, status, search, page, pageSize);
            return Ok(ApiResponse<PaginatedResponse<CustomerDebtDto>>.Ok(result));
        }

        /// <summary>GET /api/customerdebt/{id}</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await GetUserAsync();
            var item = await _service.GetDebtByIdAsync(user.TenantId, id);
            return item == null
                ? NotFound(ApiResponse<object>.Fail("Borç/alacak kaydı bulunamadı.", "NOT_FOUND"))
                : Ok(ApiResponse<object>.Ok(item, "Borç/alacak kaydı getirildi."));
        }

        /// <summary>POST /api/customerdebt</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCustomerDebtDto dto)
        {
            var user = await GetUserAsync();
            var id   = await _service.CreateDebtAsync(user.TenantId, user.Id, dto);
            return Ok(ApiResponse<object>.Ok(new { id }, "Borç/alacak kaydı oluşturuldu."));
        }

        /// <summary>PUT /api/customerdebt/{id}</summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerDebtDto dto)
        {
            var user = await GetUserAsync();
            await _service.UpdateDebtAsync(user.TenantId, user.Id, id, dto);
            return Ok(ApiResponse<object>.Ok((object?)null, "Borç/alacak kaydı güncellendi."));
        }

        /// <summary>DELETE /api/customerdebt/{id}</summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await GetUserAsync();
            await _service.DeleteDebtAsync(user.TenantId, id);
            return Ok(ApiResponse<object>.Ok((object?)null, "Borç/alacak kaydı silindi."));
        }

        // ════════════════════════════════════════════════════════════════════════
        //  ÖDEME (TAHSİLAT)
        // ════════════════════════════════════════════════════════════════════════

        /// <summary>POST /api/customerdebt/{id}/payment</summary>
        [HttpPost("{id}/payment")]
        public async Task<IActionResult> AddPayment(int id, [FromBody] CreateDebtPaymentDto dto)
        {
            var user    = await GetUserAsync();
            var payment = await _service.AddPaymentAsync(user.TenantId, user.Id, id, dto);
            return Ok(ApiResponse<object>.Ok(payment, "Ödeme kaydedildi."));
        }

        // ════════════════════════════════════════════════════════════════════════
        //  ÖZET
        // ════════════════════════════════════════════════════════════════════════

        /// <summary>GET /api/customerdebt/summary?type=Receivable</summary>
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] string? type = null)
        {
            var user    = await GetUserAsync();
            var summary = await _service.GetSummaryAsync(user.TenantId, type);
            return Ok(ApiResponse<object>.Ok(summary, "Özet getirildi."));
        }

        // ════════════════════════════════════════════════════════════════════════
        //  TAHSİLAT LİSTESİ
        // ════════════════════════════════════════════════════════════════════════

        /// <summary>GET /api/customerdebt/collections?startDate=&amp;endDate=&amp;search=&amp;page=1&amp;pageSize=20</summary>
        [HttpGet("collections")]
        public async Task<IActionResult> GetCollections(
            [FromQuery] DateTime? startDate     = null,
            [FromQuery] DateTime? endDate       = null,
            [FromQuery] string?   search        = null,
            [FromQuery] string?   paymentMethod = null,
            [FromQuery] int       page          = 1,
            [FromQuery] int       pageSize      = 20)
        {
            var user   = await GetUserAsync();
            var result = await _service.GetCollectionsAsync(
                user.TenantId, startDate, endDate, search, paymentMethod, page, pageSize);
            return Ok(ApiResponse<PaginatedResponse<CollectionListDto>>.Ok(result));
        }
    }
}
