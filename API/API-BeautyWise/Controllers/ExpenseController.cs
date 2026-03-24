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
    /// Gider yönetimi — Tüm endpoint'ler yalnızca Owner ve Admin rolüne açıktır.
    /// </summary>
    [Authorize(Roles = "Owner,Admin")]
    [ApiController]
    [Route("api/[controller]")]
    [SubscriptionRequired]
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseService    _service;
        private readonly UserManager<AppUser> _userManager;

        public ExpenseController(IExpenseService service, UserManager<AppUser> userManager)
        {
            _service     = service;
            _userManager = userManager;
        }

        private async Task<AppUser> GetUserAsync() =>
            await _userManager.GetUserAsync(User) ?? throw new Exception("Kullanıcı bulunamadı.");

        // ════════════════════════════════════════════════════════════════════════
        //  KATEGORİLER
        // ════════════════════════════════════════════════════════════════════════

        /// <summary>GET /api/expense/category</summary>
        [HttpGet("category")]
        public async Task<IActionResult> GetCategories()
        {
            var user = await GetUserAsync();
            var list = await _service.GetCategoriesAsync(user.TenantId);
            return Ok(ApiResponse<object>.Ok(list, $"{list.Count} kategori bulundu."));
        }

        /// <summary>GET /api/expense/category/{id}</summary>
        [HttpGet("category/{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var user = await GetUserAsync();
            var item = await _service.GetCategoryByIdAsync(id, user.TenantId);
            return item == null
                ? NotFound(ApiResponse<object>.Fail("Kategori bulunamadı.", "NOT_FOUND"))
                : Ok(ApiResponse<object>.Ok(item, "Kategori getirildi."));
        }

        /// <summary>POST /api/expense/category</summary>
        [HttpPost("category")]
        public async Task<IActionResult> CreateCategory([FromBody] ExpenseCategoryCreateDto dto)
        {
            var user = await GetUserAsync();
            var id   = await _service.CreateCategoryAsync(user.TenantId, user.Id, dto);
            return Ok(ApiResponse<object>.Ok(new { id }, "Kategori oluşturuldu."));
        }

        /// <summary>PUT /api/expense/category/{id}</summary>
        [HttpPut("category/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] ExpenseCategoryUpdateDto dto)
        {
            var user = await GetUserAsync();
            await _service.UpdateCategoryAsync(id, user.TenantId, dto);
            return Ok(ApiResponse<object>.Ok((object?)null, "Kategori güncellendi."));
        }

        /// <summary>DELETE /api/expense/category/{id}</summary>
        [HttpDelete("category/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var user = await GetUserAsync();
            await _service.DeleteCategoryAsync(id, user.TenantId);
            return Ok(ApiResponse<object>.Ok((object?)null, "Kategori silindi."));
        }

        // ════════════════════════════════════════════════════════════════════════
        //  GİDERLER
        // ════════════════════════════════════════════════════════════════════════

        /// <summary>GET /api/expense?startDate=&endDate=&categoryId=</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] DateTime? startDate  = null,
            [FromQuery] DateTime? endDate    = null,
            [FromQuery] int?      categoryId = null,
            [FromQuery] int?      pageNumber = null,
            [FromQuery] int?      pageSize   = null)
        {
            var user = await GetUserAsync();
            if (pageNumber.HasValue || pageSize.HasValue)
            {
                var pn = pageNumber ?? 1;
                var ps = pageSize ?? 20;
                var result = await _service.GetAllPaginatedAsync(user.TenantId, pn, ps, startDate, endDate, categoryId);
                return Ok(ApiResponse<PaginatedResponse<ExpenseListDto>>.Ok(result));
            }
            else
            {
                var list = await _service.GetAllAsync(user.TenantId, startDate, endDate, categoryId);
                return Ok(ApiResponse<object>.Ok(list, $"{list.Count} gider kaydı bulundu."));
            }
        }

        /// <summary>GET /api/expense/{id}</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await GetUserAsync();
            var item = await _service.GetByIdAsync(id, user.TenantId);
            return item == null
                ? NotFound(ApiResponse<object>.Fail("Gider kaydı bulunamadı.", "NOT_FOUND"))
                : Ok(ApiResponse<object>.Ok(item, "Gider kaydı getirildi."));
        }

        /// <summary>POST /api/expense</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ExpenseCreateDto dto)
        {
            var user = await GetUserAsync();
            var id   = await _service.CreateAsync(user.TenantId, user.Id, dto);
            return Ok(ApiResponse<object>.Ok(new { id }, "Gider kaydedildi."));
        }

        /// <summary>PUT /api/expense/{id}</summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ExpenseUpdateDto dto)
        {
            var user = await GetUserAsync();
            await _service.UpdateAsync(id, user.TenantId, dto);
            return Ok(ApiResponse<object>.Ok((object?)null, "Gider güncellendi."));
        }

        /// <summary>DELETE /api/expense/{id}</summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await GetUserAsync();
            await _service.DeleteAsync(id, user.TenantId);
            return Ok(ApiResponse<object>.Ok((object?)null, "Gider kaydı silindi."));
        }
    }
}
