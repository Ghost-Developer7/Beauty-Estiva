using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API_BeautyWise.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin")] // Sadece sistem admini
    public class SubscriptionPlanController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly Context _context;

        public SubscriptionPlanController(
            ISubscriptionService subscriptionService,
            Context context)
        {
            _subscriptionService = subscriptionService;
            _context = context;
        }

        /// <summary>
        /// Tüm abonelik planlarını listeler (Admin)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var plans = await _subscriptionService.GetAvailablePlansAsync();
                return Ok(ApiResponse<object>.Ok(plans));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Belirli bir planı getirir (Admin)
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var plan = await _subscriptionService.GetPlanByIdAsync(id);
                if (plan == null)
                    return NotFound(ApiResponse<object>.Fail("Plan bulunamadı."));

                return Ok(ApiResponse<object>.Ok(plan));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Yeni abonelik planı oluşturur (Admin)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SubscriptionPlan plan)
        {
            try
            {
                plan.CDate = DateTime.Now;
                plan.IsActive = true;

                _context.SubscriptionPlans.Add(plan);
                await _context.SaveChangesAsync();

                return Ok(ApiResponse<object>.Ok(plan, "Plan başarıyla oluşturuldu."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Abonelik planını günceller (Admin)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SubscriptionPlan updatedPlan)
        {
            try
            {
                var plan = await _context.SubscriptionPlans.FindAsync(id);
                if (plan == null)
                    return NotFound(ApiResponse<object>.Fail("Plan bulunamadı."));

                plan.Name = updatedPlan.Name;
                plan.MonthlyPrice = updatedPlan.MonthlyPrice;
                plan.YearlyPrice = updatedPlan.YearlyPrice;
                plan.MaxStaffCount = updatedPlan.MaxStaffCount;
                plan.MaxBranchCount = updatedPlan.MaxBranchCount;
                plan.HasSmsIntegration = updatedPlan.HasSmsIntegration;
                plan.HasAiFeatures = updatedPlan.HasAiFeatures;
                plan.UDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return Ok(ApiResponse<object>.Ok(plan, "Plan başarıyla güncellendi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Abonelik planını siler (Soft Delete) (Admin)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var plan = await _context.SubscriptionPlans.FindAsync(id);
                if (plan == null)
                    return NotFound(ApiResponse<object>.Fail("Plan bulunamadı."));

                plan.IsActive = false;
                plan.UDate = DateTime.Now;

                await _context.SaveChangesAsync();

                return Ok(ApiResponse<object>.Ok(true, "Plan başarıyla silindi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
