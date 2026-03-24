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
    public class PackageSaleController : ControllerBase
    {
        private readonly IPackageSaleService _svc;
        public PackageSaleController(IPackageSaleService svc) => _svc = svc;

        private int GetTenantId() => int.TryParse(User.FindFirstValue("tenantId"), out var id) ? id : 0;
        private int GetUserId()   => int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;

        // ════════════════════════════════════════
        //  PACKAGE SALES
        // ════════════════════════════════════════

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate,
            [FromQuery] int? customerId, [FromQuery] int? treatmentId,
            [FromQuery] int? status)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                var data = await _svc.GetAllAsync(tenantId, startDate, endDate, customerId, treatmentId, status);
                return Ok(ApiResponse<List<PackageSaleListDto>>.Ok(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                var data = await _svc.GetByIdAsync(id, tenantId);
                return data == null
                    ? NotFound(ApiResponse<object>.Fail("Paket satışı bulunamadı.", "NOT_FOUND"))
                    : Ok(ApiResponse<PackageSaleListDto>.Ok(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PackageSaleCreateDto dto)
        {
            var tenantId = GetTenantId();
            var staffId  = GetUserId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            if (!ModelState.IsValid) return BadRequest(ApiResponse<object>.Fail("Geçersiz veri.", "VALIDATION_ERROR"));
            try
            {
                var id = await _svc.CreateAsync(tenantId, staffId, dto);
                return Ok(ApiResponse<object>.Ok(new { Id = id }, "Paket satışı kaydedildi."));
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

        [HttpPut("{id}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] PackageSaleUpdateDto dto)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            if (!ModelState.IsValid) return BadRequest(ApiResponse<object>.Fail("Geçersiz veri.", "VALIDATION_ERROR"));
            try
            {
                await _svc.UpdateAsync(id, tenantId, dto);
                return Ok(ApiResponse<object>.Ok(true, "Paket satışı güncellendi."));
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
        public async Task<IActionResult> Delete(int id)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                await _svc.DeleteAsync(id, tenantId);
                return Ok(ApiResponse<object>.Ok(true, "Paket satışı silindi."));
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
        //  STATS
        // ════════════════════════════════════════

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats(
            [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                var data = await _svc.GetStatsAsync(tenantId, startDate, endDate);
                return Ok(ApiResponse<PackageSaleStatsDto>.Ok(data));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        // ════════════════════════════════════════
        //  USAGE (Seans Kullanımı)
        // ════════════════════════════════════════

        [HttpPost("{id}/usage")]
        public async Task<IActionResult> RecordUsage(int id, [FromBody] PackageSaleUsageCreateDto dto)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                var usageId = await _svc.RecordUsageAsync(id, tenantId, dto);
                return Ok(ApiResponse<object>.Ok(new { Id = usageId }, "Seans kullanımı kaydedildi."));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.Fail(ex.Message, "NOT_FOUND"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.Fail(ex.Message, "BUSINESS_ERROR"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        [HttpDelete("usage/{usageId}")]
        [Authorize(Roles = "Owner,Admin")]
        public async Task<IActionResult> DeleteUsage(int usageId)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            try
            {
                await _svc.DeleteUsageAsync(usageId, tenantId);
                return Ok(ApiResponse<object>.Ok(true, "Kullanım kaydı silindi."));
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
        //  PAYMENTS (Ödeme)
        // ════════════════════════════════════════

        [HttpPost("{id}/payment")]
        public async Task<IActionResult> AddPayment(int id, [FromBody] PackageSalePaymentCreateDto dto)
        {
            var tenantId = GetTenantId();
            if (tenantId == 0) return BadRequest(ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"));
            if (!ModelState.IsValid) return BadRequest(ApiResponse<object>.Fail("Geçersiz veri.", "VALIDATION_ERROR"));
            try
            {
                var paymentId = await _svc.AddPaymentAsync(id, tenantId, dto);
                return Ok(ApiResponse<object>.Ok(new { Id = paymentId }, "Ödeme kaydedildi."));
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
