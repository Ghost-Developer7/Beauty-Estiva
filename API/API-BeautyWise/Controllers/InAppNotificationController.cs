using API_BeautyWise.Filters;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API_BeautyWise.Controllers
{
    [Route("api/notification/in-app")]
    [ApiController]
    [Authorize]
    [SubscriptionRequired]
    public class InAppNotificationController : ControllerBase
    {
        private readonly IInAppNotificationService _inAppNotificationService;

        public InAppNotificationController(IInAppNotificationService inAppNotificationService)
        {
            _inAppNotificationService = inAppNotificationService;
        }

        private int GetTenantId() => int.Parse(User.FindFirstValue("tenantId")!);
        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        /// <summary>
        /// Kullanicinin bildirimlerini sayfalanmis olarak getirir.
        /// Hem kullaniciya ozel hem de tenant broadcast bildirimlerini icerir.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var result = await _inAppNotificationService.GetUserNotificationsAsync(
                    GetTenantId(), GetUserId(), page, pageSize);
                return Ok(ApiResponse<object>.Ok(result));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Bildirimler getirilirken bir hata olustu."));
            }
        }

        /// <summary>
        /// Kullanicinin okunmamis bildirim sayisini dondurur.
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var count = await _inAppNotificationService.GetUnreadCountAsync(GetTenantId(), GetUserId());
                return Ok(ApiResponse<object>.Ok(new { unreadCount = count }));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Okunmamis bildirim sayisi alinirken bir hata olustu."));
            }
        }

        /// <summary>
        /// Tek bir bildirimi okundu olarak isaretler.
        /// </summary>
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                await _inAppNotificationService.MarkAsReadAsync(GetTenantId(), GetUserId(), id);
                return Ok(ApiResponse<object>.Ok(null, "Bildirim okundu olarak isaretlendi."));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<object>.Fail("Bildirim bulunamadi.", "NOT_FOUND"));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Islem sirasinda bir hata olustu."));
            }
        }

        /// <summary>
        /// Kullanicinin tum bildirimlerini okundu olarak isaretler.
        /// </summary>
        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                await _inAppNotificationService.MarkAllAsReadAsync(GetTenantId(), GetUserId());
                return Ok(ApiResponse<object>.Ok(null, "Tum bildirimler okundu olarak isaretlendi."));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Islem sirasinda bir hata olustu."));
            }
        }

        /// <summary>
        /// Tek bir bildirimi siler (soft delete).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                await _inAppNotificationService.DeleteNotificationAsync(GetTenantId(), GetUserId(), id);
                return Ok(ApiResponse<object>.Ok(null, "Bildirim silindi."));
            }
            catch (KeyNotFoundException)
            {
                return NotFound(ApiResponse<object>.Fail("Bildirim bulunamadi.", "NOT_FOUND"));
            }
            catch (Exception)
            {
                return BadRequest(ApiResponse<object>.Fail("Islem sirasinda bir hata olustu."));
            }
        }
    }
}
