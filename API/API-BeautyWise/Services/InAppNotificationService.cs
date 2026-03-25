using API_BeautyWise.Hubs;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API_BeautyWise.Services
{
    /// <summary>
    /// In-App bildirim servisi.
    /// SignalR uzerinden gercek zamanli bildirim gonderir ve veritabanina kaydeder.
    ///
    /// BILDIRIM SENARYOLARI (Beauty Salon):
    /// ──────────────────────────────────────────────────────────────────
    ///  1. APPOINTMENT_CREATED    — Yeni randevu olusturuldugunda (staff + owner)
    ///  2. APPOINTMENT_CANCELLED  — Randevu iptal edildiginde
    ///  3. APPOINTMENT_UPDATED    — Randevu guncellendiginde
    ///  4. APPOINTMENT_REMINDER   — Randevu hatirlatmasi (1 saat once)
    ///  5. APPOINTMENT_COMPLETED  — Randevu tamamlandiginda
    ///  6. APPOINTMENT_NO_SHOW    — Musteri gelmedigi zaman
    ///  7. CUSTOMER_CREATED       — Yeni musteri eklendiginde
    ///  8. CUSTOMER_BIRTHDAY      — Musteri dogum gunu
    ///  9. PAYMENT_RECEIVED       — Odeme alindiginda
    /// 10. PAYMENT_OVERDUE        — Odeme vadesi gectiginde
    /// 11. STAFF_LEAVE_REQUESTED  — Izin talebi olusturuldugunda (owner/admin)
    /// 12. STAFF_LEAVE_APPROVED   — Izin onaylandiginda (staff)
    /// 13. STAFF_LEAVE_REJECTED   — Izin reddedildiginde (staff)
    /// 14. PACKAGE_EXPIRING       — Paket suresi dolmak uzere
    /// 15. PACKAGE_COMPLETED      — Paket tamamlandiginda
    /// 16. SUBSCRIPTION_EXPIRING  — Abonelik suresi dolmak uzere
    /// 17. SUBSCRIPTION_EXPIRED   — Abonelik suresi doldugunda
    /// 18. DAILY_SUMMARY          — Gunluk ozet (her gun sabah)
    /// 19. LOW_STOCK              — Urun stoku azaldiginda
    /// 20. DEBT_OVERDUE           — Borc vadesi gectiginde
    /// 21. NEW_REVIEW             — Yeni musteri yorumu
    /// 22. COMMISSION_CALCULATED  — Komisyon hesaplandiginda (staff)
    /// ──────────────────────────────────────────────────────────────────
    ///
    /// DeduplicationKey formati: {Type}_{EntityId}_{Date:yyyyMMdd}
    /// Ornek: APPOINTMENT_CREATED_123_20260325
    /// Ayni key 24 saat icinde zaten varsa bildirim atlanir.
    /// </summary>
    public class InAppNotificationService : IInAppNotificationService
    {
        private readonly Context _context;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<InAppNotificationService> _logger;

        public InAppNotificationService(
            Context context,
            IHubContext<NotificationHub> hubContext,
            ILogger<InAppNotificationService> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task SendNotificationAsync(
            int tenantId,
            int? userId,
            string title,
            string message,
            string type = "info",
            string? entityType = null,
            int? entityId = null,
            string? actionUrl = null,
            string? icon = null,
            string? deduplicationKey = null)
        {
            // Deduplication kontrolu: ayni key son 24 saat icinde varsa atla
            if (!string.IsNullOrEmpty(deduplicationKey))
            {
                var cutoff = DateTime.UtcNow.AddHours(-24);
                var exists = await _context.InAppNotifications
                    .AnyAsync(n =>
                        n.DeduplicationKey == deduplicationKey &&
                        n.TenantId == tenantId &&
                        n.CDate >= cutoff &&
                        n.IsActive == true);

                if (exists)
                {
                    _logger.LogDebug(
                        "Deduplication: bildirim atlandi. Key={Key}, TenantId={TenantId}",
                        deduplicationKey, tenantId);
                    return;
                }
            }

            var notification = new InAppNotification
            {
                TenantId = tenantId,
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                EntityType = entityType,
                EntityId = entityId,
                IsRead = false,
                ActionUrl = actionUrl,
                Icon = icon,
                DeduplicationKey = deduplicationKey,
                CDate = DateTime.UtcNow,
                IsActive = true
            };

            _context.InAppNotifications.Add(notification);
            await _context.SaveChangesAsync();

            // SignalR ile gercek zamanli bildirim gonder
            var payload = MapToDto(notification);

            if (userId.HasValue)
            {
                // Belirli kullaniciya gonder
                await _hubContext.Clients
                    .Group($"user_{userId.Value}")
                    .SendAsync("ReceiveNotification", payload);
            }
            else
            {
                // Tum tenant kullanicilarina broadcast
                await _hubContext.Clients
                    .Group($"tenant_{tenantId}")
                    .SendAsync("ReceiveNotification", payload);
            }

            _logger.LogInformation(
                "In-app bildirim gonderildi. Id={Id}, TenantId={TenantId}, UserId={UserId}, Type={Type}",
                notification.Id, tenantId, userId, type);
        }

        public async Task SendTenantNotificationAsync(
            int tenantId,
            string title,
            string message,
            string type = "info",
            string? entityType = null,
            int? entityId = null,
            string? actionUrl = null,
            string? icon = null,
            string? deduplicationKey = null)
        {
            await SendNotificationAsync(
                tenantId,
                userId: null,
                title,
                message,
                type,
                entityType,
                entityId,
                actionUrl,
                icon,
                deduplicationKey);
        }

        public async Task<object> GetUserNotificationsAsync(int tenantId, int userId, int page = 1, int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 50) pageSize = 50;

            // Kullaniciya ozel + tenant broadcast bildirimlerini getir
            var query = _context.InAppNotifications
                .Where(n =>
                    n.TenantId == tenantId &&
                    n.IsActive == true &&
                    (n.UserId == userId || n.UserId == null))
                .OrderByDescending(n => n.CDate);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            var notifications = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new
                {
                    n.Id,
                    n.Title,
                    n.Message,
                    n.Type,
                    n.EntityType,
                    n.EntityId,
                    n.IsRead,
                    n.ReadAt,
                    n.ActionUrl,
                    n.Icon,
                    CreatedAt = n.CDate
                })
                .ToListAsync();

            return new
            {
                items = notifications,
                totalCount,
                totalPages,
                currentPage = page,
                pageSize
            };
        }

        public async Task<int> GetUnreadCountAsync(int tenantId, int userId)
        {
            return await _context.InAppNotifications
                .CountAsync(n =>
                    n.TenantId == tenantId &&
                    n.IsActive == true &&
                    (n.UserId == userId || n.UserId == null) &&
                    !n.IsRead);
        }

        public async Task MarkAsReadAsync(int tenantId, int userId, int notificationId)
        {
            var notification = await _context.InAppNotifications
                .FirstOrDefaultAsync(n =>
                    n.Id == notificationId &&
                    n.TenantId == tenantId &&
                    n.IsActive == true &&
                    (n.UserId == userId || n.UserId == null));

            if (notification == null)
                throw new KeyNotFoundException("Bildirim bulunamadi.");

            if (notification.IsRead)
                return;

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            notification.UDate = DateTime.UtcNow;
            notification.UUser = userId;

            await _context.SaveChangesAsync();

            // Okunmamis sayisini guncelle
            var unreadCount = await GetUnreadCountAsync(tenantId, userId);
            await _hubContext.Clients
                .Group($"user_{userId}")
                .SendAsync("UnreadCountUpdated", unreadCount);
        }

        public async Task MarkAllAsReadAsync(int tenantId, int userId)
        {
            var unreadNotifications = await _context.InAppNotifications
                .Where(n =>
                    n.TenantId == tenantId &&
                    n.IsActive == true &&
                    (n.UserId == userId || n.UserId == null) &&
                    !n.IsRead)
                .ToListAsync();

            if (unreadNotifications.Count == 0)
                return;

            var now = DateTime.UtcNow;
            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
                notification.ReadAt = now;
                notification.UDate = now;
                notification.UUser = userId;
            }

            await _context.SaveChangesAsync();

            // Okunmamis sayisini sifirla
            await _hubContext.Clients
                .Group($"user_{userId}")
                .SendAsync("UnreadCountUpdated", 0);
        }

        public async Task DeleteNotificationAsync(int tenantId, int userId, int notificationId)
        {
            var notification = await _context.InAppNotifications
                .FirstOrDefaultAsync(n =>
                    n.Id == notificationId &&
                    n.TenantId == tenantId &&
                    n.IsActive == true &&
                    (n.UserId == userId || n.UserId == null));

            if (notification == null)
                throw new KeyNotFoundException("Bildirim bulunamadi.");

            // Soft delete
            notification.IsActive = false;
            notification.UDate = DateTime.UtcNow;
            notification.UUser = userId;

            await _context.SaveChangesAsync();

            // Okunmamis sayisini guncelle (silinen okunmamis olabilir)
            if (!notification.IsRead)
            {
                var unreadCount = await GetUnreadCountAsync(tenantId, userId);
                await _hubContext.Clients
                    .Group($"user_{userId}")
                    .SendAsync("UnreadCountUpdated", unreadCount);
            }
        }

        private static object MapToDto(InAppNotification n)
        {
            return new
            {
                n.Id,
                n.Title,
                n.Message,
                n.Type,
                n.EntityType,
                n.EntityId,
                n.IsRead,
                n.ReadAt,
                n.ActionUrl,
                n.Icon,
                CreatedAt = n.CDate
            };
        }
    }
}
