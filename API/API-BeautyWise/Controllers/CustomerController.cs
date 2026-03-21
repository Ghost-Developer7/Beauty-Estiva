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
        public async Task<IActionResult> GetAll([FromQuery] string? search = null)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _customerService.GetAllAsync(tenantId, search);
                return Ok(ApiResponse<List<CustomerListDto>>.Ok(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
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
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
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
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                return BadRequest(ApiResponse<object>.Fail(parts.Length > 1 ? parts[1] : ex.Message,
                                                            parts.Length > 1 ? parts[0] : null));
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
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                return BadRequest(ApiResponse<object>.Fail(parts.Length > 1 ? parts[1] : ex.Message,
                                                            parts.Length > 1 ? parts[0] : null));
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
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                return BadRequest(ApiResponse<object>.Fail(parts.Length > 1 ? parts[1] : ex.Message,
                                                            parts.Length > 1 ? parts[0] : null));
            }
        }
    }
}
