using API_BeautyWise.Filters;
using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API_BeautyWise.Controllers
{
    /// <summary>
    /// Müşteri yönetimi (Owner + Staff erişebilir)
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Owner,Staff,Admin")]
    [SubscriptionRequired]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomerController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        private int GetTenantId() =>
            int.TryParse(User.FindFirstValue("tenantId"), out var id) ? id : 0;

        /// <summary>
        /// Müşteri listesi. Arama: ?search=ad/soyad/telefon
        /// GET /api/customer
        /// GET /api/customer?search=Ayşe
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search     = null,
            [FromQuery] int?    pageNumber = null,
            [FromQuery] int?    pageSize   = null)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                if (pageNumber.HasValue || pageSize.HasValue)
                {
                    var pn = pageNumber ?? 1;
                    var ps = pageSize ?? 20;
                    var result = await _customerService.GetAllPaginatedAsync(tenantId, pn, ps, search);
                    return Ok(ApiResponse<PaginatedResponse<CustomerListDto>>.Ok(result));
                }
                else
                {
                    var result = await _customerService.GetAllAsync(tenantId, search);
                    return Ok(ApiResponse<List<CustomerListDto>>.Ok(result));
                }
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Müşteri detayı (son 5 randevu dahil)
        /// GET /api/customer/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _customerService.GetByIdAsync(id, tenantId);
                if (result == null) return NotFound(ApiResponse<object>.Fail("Müşteri bulunamadı."));

                return Ok(ApiResponse<CustomerDetailDto>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Yeni müşteri ekle
        /// POST /api/customer
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CustomerCreateDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var id = await _customerService.CreateAsync(tenantId, dto);
                return Ok(ApiResponse<object>.Ok(new { Id = id }, "Müşteri başarıyla eklendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Müşteri güncelle
        /// PUT /api/customer/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CustomerUpdateDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                await _customerService.UpdateAsync(id, tenantId, dto);
                return Ok(ApiResponse<object>.Ok(true, "Müşteri güncellendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Müşteri sil (soft delete)
        /// DELETE /api/customer/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                await _customerService.DeleteAsync(id, tenantId);
                return Ok(ApiResponse<object>.Ok(true, "Müşteri silindi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /* ════════════════════════════════════════════
           LOYALTY & HISTORY ENDPOINTS
           ════════════════════════════════════════════ */

        /// <summary>
        /// Müşteri ziyaret/satın alma geçmişi
        /// GET /api/customer/{id}/history
        /// </summary>
        [HttpGet("{id:int}/history")]
        public async Task<IActionResult> GetHistory(int id)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _customerService.GetHistoryAsync(id, tenantId);
                return Ok(ApiResponse<CustomerHistoryDto>.Ok(result));
            }
            catch (Exception ex) when (ex.Message.StartsWith("NOT_FOUND"))
            {
                return NotFound(ApiResponse<object>.Fail("Müşteri bulunamadı."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Müşteri istatistikleri
        /// GET /api/customer/{id}/stats
        /// </summary>
        [HttpGet("{id:int}/stats")]
        public async Task<IActionResult> GetStats(int id)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _customerService.GetStatsAsync(id, tenantId);
                return Ok(ApiResponse<CustomerStatsDto>.Ok(result));
            }
            catch (Exception ex) when (ex.Message.StartsWith("NOT_FOUND"))
            {
                return NotFound(ApiResponse<object>.Fail("Müşteri bulunamadı."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Sadakat puanı güncelle (ekle/çıkar)
        /// PUT /api/customer/{id}/loyalty-points
        /// </summary>
        [HttpPut("{id:int}/loyalty-points")]
        public async Task<IActionResult> UpdateLoyaltyPoints(int id, [FromBody] UpdateLoyaltyPointsDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                await _customerService.UpdateLoyaltyPointsAsync(id, tenantId, dto);
                return Ok(ApiResponse<object>.Ok(true, "Sadakat puanları güncellendi."));
            }
            catch (Exception ex) when (ex.Message.StartsWith("NOT_FOUND"))
            {
                return NotFound(ApiResponse<object>.Fail("Müşteri bulunamadı."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Müşteri etiketleri güncelle
        /// PUT /api/customer/{id}/tags
        /// </summary>
        [HttpPut("{id:int}/tags")]
        public async Task<IActionResult> UpdateTags(int id, [FromBody] UpdateCustomerTagsDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                await _customerService.UpdateTagsAsync(id, tenantId, dto);
                return Ok(ApiResponse<object>.Ok(true, "Etiketler güncellendi."));
            }
            catch (Exception ex) when (ex.Message.StartsWith("NOT_FOUND"))
            {
                return NotFound(ApiResponse<object>.Fail("Müşteri bulunamadı."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// VIP / en iyi müşteriler
        /// GET /api/customer/vip
        /// </summary>
        [HttpGet("vip")]
        public async Task<IActionResult> GetVipCustomers()
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _customerService.GetVipCustomersAsync(tenantId);
                return Ok(ApiResponse<List<CustomerListDto>>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
