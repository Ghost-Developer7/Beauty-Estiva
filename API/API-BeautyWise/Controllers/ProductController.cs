using API_BeautyWise.Filters;
using System.Security.Claims;
using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API_BeautyWise.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Owner,Admin,Staff")]
    [SubscriptionRequired]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _svc;
        public ProductController(IProductService svc) => _svc = svc;

        private int GetTenantId() => int.TryParse(User.FindFirstValue("tenantId"), out var id) ? id : 0;
        private int GetUserId()   => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        // ════════════════════════════════════════
        //  PRODUCTS
        // ════════════════════════════════════════

        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                var data = await _svc.GetAllProductsAsync(tenantId);
                return Ok(ApiResponse<List<ProductListDto>>.Ok(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                var data = await _svc.GetProductByIdAsync(id, tenantId);
                return data == null
                    ? NotFound(ApiResponse<object>.Fail("Ürün bulunamadı.", "NOT_FOUND"))
                    : Ok(ApiResponse<ProductListDto>.Ok(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpPost]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateDto dto)
        {
            var tenantId = GetTenantId();
            var userId   = GetUserId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            if (!ModelState.IsValid) return BadRequest(ApiResponse<object>.Fail("Geçersiz veri.", "VALIDATION_ERROR"));
            try
            {
                var id = await _svc.CreateProductAsync(tenantId, userId, dto);
                return Ok(ApiResponse<object>.Ok(new { Id = id }, "Ürün başarıyla oluşturuldu."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductUpdateDto dto)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            if (!ModelState.IsValid) return BadRequest(ApiResponse<object>.Fail("Geçersiz veri.", "VALIDATION_ERROR"));
            try
            {
                await _svc.UpdateProductAsync(id, tenantId, dto);
                return Ok(ApiResponse<object>.Ok(true, "Ürün güncellendi."));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message, "NOT_FOUND"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                await _svc.DeleteProductAsync(id, tenantId);
                return Ok(ApiResponse<object>.Ok(true, "Ürün silindi."));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message, "NOT_FOUND"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        // ════════════════════════════════════════
        //  PRODUCT SALES
        // ════════════════════════════════════════

        [HttpGet("sales")]
        public async Task<IActionResult> GetSales(
            [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate,
            [FromQuery] int? staffId, [FromQuery] int? customerId,
            [FromQuery] int? pageNumber = null, [FromQuery] int? pageSize = null)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                if (pageNumber.HasValue || pageSize.HasValue)
                {
                    var pn = pageNumber ?? 1;
                    var ps = pageSize ?? 20;
                    var data = await _svc.GetAllSalesPaginatedAsync(tenantId, pn, ps, startDate, endDate, staffId, customerId);
                    return Ok(ApiResponse<PaginatedResponse<ProductSaleListDto>>.Ok(data));
                }
                else
                {
                    var data = await _svc.GetAllSalesAsync(tenantId, startDate, endDate, staffId, customerId);
                    return Ok(ApiResponse<List<ProductSaleListDto>>.Ok(data));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpGet("sales/{id}")]
        public async Task<IActionResult> GetSale(int id)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                var data = await _svc.GetSaleByIdAsync(id, tenantId);
                return data == null
                    ? NotFound(ApiResponse<object>.Fail("Satış bulunamadı.", "NOT_FOUND"))
                    : Ok(ApiResponse<ProductSaleListDto>.Ok(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpPost("sales")]
        public async Task<IActionResult> CreateSale([FromBody] ProductSaleCreateDto dto)
        {
            var tenantId = GetTenantId();
            var staffId  = GetUserId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            if (!ModelState.IsValid) return BadRequest(ApiResponse<object>.Fail("Geçersiz veri.", "VALIDATION_ERROR"));
            try
            {
                var id = await _svc.CreateSaleAsync(tenantId, staffId, dto);
                return Ok(ApiResponse<object>.Ok(new { Id = id }, "Satış kaydedildi."));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message, "NOT_FOUND"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpPut("sales/{id}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> UpdateSale(int id, [FromBody] ProductSaleUpdateDto dto)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            if (!ModelState.IsValid) return BadRequest(ApiResponse<object>.Fail("Geçersiz veri.", "VALIDATION_ERROR"));
            try
            {
                await _svc.UpdateSaleAsync(id, tenantId, dto);
                return Ok(ApiResponse<object>.Ok(true, "Satış güncellendi."));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message, "NOT_FOUND"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpDelete("sales/{id}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> DeleteSale(int id)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                await _svc.DeleteSaleAsync(id, tenantId);
                return Ok(ApiResponse<object>.Ok(true, "Satış silindi."));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message, "NOT_FOUND"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }
    }
}
