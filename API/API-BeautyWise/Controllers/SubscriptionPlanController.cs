using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API_BeautyWise.Controllers
{
    /// <summary>
    /// SuperAdmin paket yönetimi endpoint'leri.
    /// Tüm endpoint'ler [SuperAdmin] rolü gerektirir.
    /// </summary>
    [ApiController]
    [Route("api/admin/subscription-plans")]
    [Authorize(Roles = "SuperAdmin")]
    public class SubscriptionPlanController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionPlanController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        /// <summary>
        /// Tüm abonelik paketlerini listeler (aktif/pasif dahil).
        /// GET /api/admin/subscription-plans
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var plans = await _subscriptionService.GetAllPlansAsync();
                return Ok(ApiResponse<List<SubscriptionPlan>>.Ok(plans));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Belirli bir planı getirir.
        /// GET /api/admin/subscription-plans/{id}
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var plan = await _subscriptionService.GetPlanByIdAsync(id);
                if (plan == null)
                    return NotFound(ApiResponse<object>.Fail("Plan bulunamadı.", "NOT_FOUND"));

                return Ok(ApiResponse<SubscriptionPlan>.Ok(plan));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Plan bilgilerini günceller.
        /// PUT /api/admin/subscription-plans/{id}
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SubscriptionPlanUpdateDto dto)
        {
            try
            {
                var updatedPlan = new SubscriptionPlan
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    MonthlyPrice = dto.MonthlyPrice,
                    YearlyPrice = dto.YearlyPrice,
                    MaxStaffCount = dto.MaxStaffCount,
                    MaxBranchCount = dto.MaxBranchCount,
                    HasSmsIntegration = dto.HasSmsIntegration,
                    HasWhatsappIntegration = dto.HasWhatsappIntegration,
                    HasSocialMediaIntegration = dto.HasSocialMediaIntegration,
                    HasAiFeatures = dto.HasAiFeatures,
                    Features = dto.Features,
                    ValidityMonths = dto.ValidityMonths
                };

                var result = await _subscriptionService.UpdatePlanAsync(id, updatedPlan);
                if (result == null)
                    return NotFound(ApiResponse<object>.Fail("Plan bulunamadı.", "NOT_FOUND"));

                return Ok(ApiResponse<SubscriptionPlan>.Ok(result, "Plan başarıyla güncellendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Plan aktif/pasif durumunu değiştirir.
        /// PATCH /api/admin/subscription-plans/{id}/toggle
        /// </summary>
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> Toggle(int id)
        {
            try
            {
                var result = await _subscriptionService.TogglePlanStatusAsync(id);
                if (!result)
                    return NotFound(ApiResponse<object>.Fail("Plan bulunamadı.", "NOT_FOUND"));

                return Ok(ApiResponse<object>.Ok(true, "Plan durumu değiştirildi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }

    /// <summary>
    /// Plan güncelleme DTO'su
    /// </summary>
    public class SubscriptionPlanUpdateDto
    {
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public decimal MonthlyPrice { get; set; }
        public decimal YearlyPrice { get; set; }
        public int MaxStaffCount { get; set; }
        public int MaxBranchCount { get; set; }
        public bool HasSmsIntegration { get; set; }
        public bool HasWhatsappIntegration { get; set; }
        public bool HasSocialMediaIntegration { get; set; }
        public bool HasAiFeatures { get; set; }
        public string? Features { get; set; }
        public int ValidityMonths { get; set; } = 1;
    }
}
