using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace API_BeautyWise.Controllers
{
    /// <summary>
    /// PayTR Odeme Bildirimleri
    /// Bu controller PayTR'in sunucudan sunucuya gonderdigi bildirimleri alir.
    /// JWT auth YOKTUR - PayTR kendi sunucularindan POST atar.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentCallbackController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentCallbackController> _logger;

        public PaymentCallbackController(
            IPaymentService paymentService,
            ILogger<PaymentCallbackController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        /// <summary>
        /// PayTR Bildirim URL (callback_link)
        /// PayTR odeme tamamlandiginda bu endpoint'i sunucu tarafindan POST eder.
        ///
        /// KRITIK KURALLAR:
        /// 1. Yanit olarak duz metin "OK" donulmeli (200 OK)
        /// 2. "OK" donulmezse PayTR islemi basarisiz sayar ve tekrar dener
        /// 3. Bu endpoint JWT auth OLMAMALI (PayTR'in token'i yoktur)
        /// 4. Hash dogrulama MUTLAKA yapilmali (guvenlik)
        ///
        /// PayTR POST ettigi alanlar:
        ///   merchant_oid       : Siparis numarasi (bizim olusturdugumuz)
        ///   status             : "success" veya "failed"
        ///   total_amount       : Tutar (kurus cinsinden, ornek: 29900 = 299 TL)
        ///   hash               : HMAC-SHA256 guvenlik hash'i
        ///   failed_reason_code : Basarisiz neden kodu (opsiyonel)
        ///   failed_reason_msg  : Basarisiz neden mesaji (opsiyonel)
        ///   test_mode          : "1" test, "0" canli
        ///   payment_type       : "card" vb.
        ///   installment_count  : Taksit sayisi
        ///   currency           : Para birimi
        /// </summary>
        [HttpPost("paytr")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> PayTrNotification()
        {
            try
            {
                // PayTR application/x-www-form-urlencoded ile gonderir
                var form = Request.Form;

                var callbackDto = new PayTrCallbackDto
                {
                    MerchantOid      = form["merchant_oid"].ToString(),
                    Status           = form["status"].ToString(),
                    TotalAmount      = form["total_amount"].ToString(),
                    Hash             = form["hash"].ToString(),
                    FailedReasonCode = form["failed_reason_code"].ToString(),
                    FailedReasonMsg  = form["failed_reason_msg"].ToString(),
                    TestMode         = form["test_mode"].ToString(),
                    PaymentType      = form["payment_type"].ToString(),
                    InstallmentCount = form["installment_count"].ToString(),
                    Currency         = form["currency"].ToString()
                };

                _logger.LogInformation(
                    "PayTR callback alindi. MerchantOid: {Oid}, Status: {Status}, Amount: {Amount}",
                    callbackDto.MerchantOid, callbackDto.Status, callbackDto.TotalAmount);

                if (string.IsNullOrEmpty(callbackDto.MerchantOid) || string.IsNullOrEmpty(callbackDto.Hash))
                {
                    _logger.LogWarning("PayTR callback: Gecersiz veri alindi.");
                    return Content("PAYTR notification FAILED: missing fields", "text/plain");
                }

                var result = await _paymentService.HandlePaymentCallbackAsync(callbackDto);

                if (!result.Success && result.PaymentStatus == "HashError")
                {
                    _logger.LogError("PayTR hash dogrulamasi basarisiz! MerchantOid: {Oid}", callbackDto.MerchantOid);
                    return Content("PAYTR notification FAILED: bad hash", "text/plain");
                }

                _logger.LogInformation(
                    "PayTR callback islendi. SubscriptionId: {SubId}, Status: {Status}",
                    result.SubscriptionId, result.PaymentStatus);

                // PayTR "OK" yaniti bekler - bu olmadan islemi tekrar dener
                return Content("OK", "text/plain");
            }
            catch (Exception)
            {
                _logger.LogError(ex, "PayTR callback isleme hatasi.");
                return Content("PAYTR notification FAILED: system error", "text/plain");
            }
        }

        /// <summary>
        /// Odeme durum sorgulama
        /// Frontend belirli bir siparisin odeme durumunu sorgular.
        /// GET /api/paymentcallback/status/{merchantOid}
        /// </summary>
        [HttpGet("status/{merchantOid}")]
        public async Task<IActionResult> GetPaymentStatus(string merchantOid)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(merchantOid))
                    return BadRequest(ApiResponse<object>.Fail("Merchant OID bos olamaz."));

                var result = await _paymentService.QueryPaymentStatusAsync(merchantOid);
                return Ok(ApiResponse<PaymentStatusResultDto>.Ok(result));
            }
            catch (Exception)
            {
                _logger.LogError(ex, "Odeme durum sorgu hatasi. MerchantOid: {Oid}", merchantOid);
                return StatusCode(500, ApiResponse<object>.Fail("Durum sorgulanirken hata olustu."));
            }
        }
    }
}
