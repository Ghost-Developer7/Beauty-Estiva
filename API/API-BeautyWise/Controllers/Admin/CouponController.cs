using API_BeautyWise.DTO;
using API_BeautyWise.Helpers;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API_BeautyWise.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin")] // Sadece sistem admini
    public class CouponController : ControllerBase
    {
        private readonly ICouponService _couponService;

        public CouponController(ICouponService couponService)
        {
            _couponService = couponService;
        }

        /// <summary>
        /// Tüm kuponları listeler (Admin)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var coupons = await _couponService.GetAllCouponsAsync();
                return Ok(ApiResponse<object>.Ok(coupons));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        /// <summary>
        /// Belirli bir kuponu getirir (Admin)
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var coupon = await _couponService.GetCouponByIdAsync(id);
                if (coupon == null)
                    return NotFound(ApiResponse<object>.Fail("Kupon bulunamadı."));

                var usageCount = await _couponService.GetCouponUsageCountAsync(id);

                return Ok(ApiResponse<object>.Ok(new
                {
                    Coupon = coupon,
                    UsageCount = usageCount
                }));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        /// <summary>
        /// Yeni kupon oluşturur (Admin)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CouponDto dto)
        {
            try
            {
                var coupon = await _couponService.CreateCouponAsync(dto);
                return Ok(ApiResponse<object>.Ok(coupon, "Kupon başarıyla oluşturuldu."));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                var errorMessage = parts.Length > 1 ? parts[1] : ex.Message;
                return BadRequest(ApiResponse<object>.Fail(errorMessage));
            }
        }

        /// <summary>
        /// Kuponu günceller (Admin)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CouponDto dto)
        {
            try
            {
                var coupon = await _couponService.UpdateCouponAsync(id, dto);
                return Ok(ApiResponse<object>.Ok(coupon, "Kupon başarıyla güncellendi."));
            }
            catch (Exception ex)
            {
                var parts = ex.Message.Split('|');
                var errorMessage = parts.Length > 1 ? parts[1] : ex.Message;
                return BadRequest(ApiResponse<object>.Fail(errorMessage));
            }
        }

        /// <summary>
        /// Kuponu siler (Soft Delete) (Admin)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _couponService.DeleteCouponAsync(id);
                if (!success)
                    return NotFound(ApiResponse<object>.Fail("Kupon bulunamadı."));

                return Ok(ApiResponse<object>.Ok(true, "Kupon başarıyla silindi."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }

        /// <summary>
        /// Kupon doğrulama (Test için - Admin)
        /// </summary>
        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromBody] ValidateCouponRequest request)
        {
            try
            {
                var result = await _couponService.ValidateCouponAsync(
                    request.Code, 
                    request.TenantId, 
                    request.OriginalPrice);

                return Ok(ApiResponse<object>.Ok(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.Fail(ex.Message));
            }
        }
    }

    // Request DTO
    public class ValidateCouponRequest
    {
        public string Code { get; set; }
        public int TenantId { get; set; }
        public decimal OriginalPrice { get; set; }
    }
}
