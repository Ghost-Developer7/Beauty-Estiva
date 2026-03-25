namespace API_BeautyWise.Services.Interface
{
    public interface IInAppNotificationService
    {
        /// <summary>
        /// Belirli bir kullaniciya bildirim gonderir. userId null ise tum tenant kullanicilarina broadcast yapar.
        /// </summary>
        Task SendNotificationAsync(
            int tenantId,
            int? userId,
            string title,
            string message,
            string type = "info",
            string? entityType = null,
            int? entityId = null,
            string? actionUrl = null,
            string? icon = null,
            string? deduplicationKey = null);

        /// <summary>
        /// Tum tenant kullanicilarina broadcast bildirim gonderir.
        /// </summary>
        Task SendTenantNotificationAsync(
            int tenantId,
            string title,
            string message,
            string type = "info",
            string? entityType = null,
            int? entityId = null,
            string? actionUrl = null,
            string? icon = null,
            string? deduplicationKey = null);

        /// <summary>
        /// Kullanicinin bildirimlerini sayfalanmis olarak getirir.
        /// </summary>
        Task<object> GetUserNotificationsAsync(int tenantId, int userId, int page = 1, int pageSize = 20);

        /// <summary>
        /// Kullanicinin okunmamis bildirim sayisini dondurur.
        /// </summary>
        Task<int> GetUnreadCountAsync(int tenantId, int userId);

        /// <summary>
        /// Tek bir bildirimi okundu olarak isaretler.
        /// </summary>
        Task MarkAsReadAsync(int tenantId, int userId, int notificationId);

        /// <summary>
        /// Kullanicinin tum bildirimlerini okundu olarak isaretler.
        /// </summary>
        Task MarkAllAsReadAsync(int tenantId, int userId);

        /// <summary>
        /// Tek bir bildirimi siler (soft delete).
        /// </summary>
        Task DeleteNotificationAsync(int tenantId, int userId, int notificationId);
    }
}
