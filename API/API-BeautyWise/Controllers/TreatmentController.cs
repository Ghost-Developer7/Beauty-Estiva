using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API_BeautyWise.Controllers
{
    /// <summary>
    /// Hizmet / İşlem yönetimi
    /// Listeleme: Owner + Staff | CRUD: Owner + Admin
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Owner,Staff,Admin")]
    public class TreatmentController : ControllerBase
    {
        private readonly ITreatmentService _treatmentService;

        public TreatmentController(ITreatmentService treatmentService)
        {
            _treatmentService = treatmentService;
        }

        private int GetTenantId() =>
            int.TryParse(User.FindFirstValue("tenantId"), out var id) ? id : 0;

        /// <summary>
        /// Tüm hizmetleri listele
        /// GET /api/treatment
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _treatmentService.GetAllAsync(tenantId);
                return Ok(ApiResponse<List<TreatmentListDto>>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Hizmet detayı
        /// GET /api/treatment/{id}
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var result = await _treatmentService.GetByIdAsync(id, tenantId);
                if (result == null) return NotFound(ApiResponse<object>.Fail("Hizmet bulunamadı."));

                return Ok(ApiResponse<TreatmentListDto>.Ok(result));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Yeni hizmet ekle
        /// POST /api/treatment
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Create([FromBody] TreatmentCreateDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                var id = await _treatmentService.CreateAsync(tenantId, dto);
                return Ok(ApiResponse<object>.Ok(new { Id = id }, "Hizmet başarıyla eklendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Hizmet güncelle
        /// PUT /api/treatment/{id}
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] TreatmentUpdateDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                await _treatmentService.UpdateAsync(id, tenantId, dto);
                return Ok(ApiResponse<object>.Ok(true, "Hizmet güncellendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Hizmet sil
        /// DELETE /api/treatment/{id}
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadı."));

                await _treatmentService.DeleteAsync(id, tenantId);
                return Ok(ApiResponse<object>.Ok(true, "Hizmet silindi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
