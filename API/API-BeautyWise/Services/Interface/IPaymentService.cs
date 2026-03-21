using API_BeautyWise.DTO;

namespace API_BeautyWise.Services.Interface
{
    public interface IPaymentService
    {
        /// <summary>
        /// PayTR IFRAME token alır. (Adım 1)
        /// Frontend bu token ile ödeme iframe'ini embed eder.
        /// </summary>
        Task<PaymentInitializeResultDto> InitializePaymentAsync(
            int tenantId,
            int subscriptionId,
            decimal amount,
            string userIp);

        /// <summary>
        /// PayTR'dan gelen sunucu bildirimi (callback) işler. (Adım 2)
        /// PayTR, ödeme tamamlandığında bu endpoint'i çağırır.
        /// Yanıt olarak "OK" dönülmelidir.
        /// </summary>
        Task<PaymentCallbackResultDto> HandlePaymentCallbackAsync(PayTrCallbackDto callbackDto);

        /// <summary>
        /// PayTR üzerinden kısmi veya tam iade işlemi başlatır.
        /// </summary>
        Task<PaymentRefundResultDto> ProcessRefundAsync(
            int subscriptionId,
            decimal refundAmount,
            string reason);

        /// <summary>
        /// Belirli bir siparişin ödeme durumunu PayTR'dan sorgular.
        /// </summary>
        Task<PaymentStatusResultDto> QueryPaymentStatusAsync(string merchantOid);

        /// <summary>
        /// Ödeme geçmişine yeni kayıt ekler.
        /// </summary>
        Task<bool> SavePaymentHistoryAsync(
            int tenantId,
            int subscriptionId,
            decimal amount,
            string status,
            string? merchantOid = null,
            string? payTrReferenceNo = null);
    }
}
