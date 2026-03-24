using System.Security.Claims;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API_BeautyWise.Filters
{
    /// <summary>
    /// Aktif abonelik kontrolü yapan action filter.
    /// Abonelik yoksa veya süresi dolmuşsa 403 döner.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class SubscriptionRequiredAttribute : Attribute, IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // SuperAdmin abonelik kontrolünden muaf
            if (context.HttpContext.User.IsInRole("SuperAdmin"))
            {
                await next();
                return;
            }

            var tenantIdClaim = context.HttpContext.User.FindFirstValue("tenantId");
            if (string.IsNullOrEmpty(tenantIdClaim) || !int.TryParse(tenantIdClaim, out var tenantId) || tenantId == 0)
            {
                context.Result = new ObjectResult(
                    ApiResponse<object>.Fail("Geçersiz oturum.", "AUTH_ERROR"))
                { StatusCode = 401 };
                return;
            }

            var subscriptionService = context.HttpContext.RequestServices
                .GetRequiredService<ISubscriptionService>();

            var isActive = await subscriptionService.IsSubscriptionActiveAsync(tenantId);
            if (!isActive)
            {
                context.Result = new ObjectResult(
                    ApiResponse<object>.Fail(
                        "Aktif aboneliğiniz bulunmuyor. Lütfen bir plan satın alın.",
                        "SUBSCRIPTION_REQUIRED"))
                { StatusCode = 403 };
                return;
            }

            await next();
        }
    }
}
