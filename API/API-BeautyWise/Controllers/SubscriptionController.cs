using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API_BeautyWise.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        // ----------------------------------------------------------------
        //  YARDIMCI: JWT claim'den tenantId okur
        // ----------------------------------------------------------------
        private int GetTenantId()
        {
            return int.TryParse(User.FindFirstValue("tenantId"), out var id) ? id : 0;
        }

        // ----------------------------------------------------------------
        //  YARDIMCI: Kullanicinin IP adresini alir
        //  PayTR token hesabi icin zorunludur.
        // ----------------------------------------------------------------
        private string GetClientIp()
        {
            // X-Forwarded-For (proxy/load balancer arkasindan)
            var forwarded = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwarded))
                return forwarded.Split(',')[0].Trim();

            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        }

        /// <summary>
        /// Tum abonelik paketlerini listeler.
        /// PUBLIC - Herkes erisebilir (kayit oncesi gorulebilmeli)
        /// GET /api/subscription/plans
        /// </summary>
        [HttpGet("plans")]
        public async Task<IActionResult> GetPlans()
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
        /// Mevcut aktif abonelik bilgisini getirir.
        /// [Owner] JWT gerekli
        /// GET /api/subscription/current
        /// </summary>
        [HttpGet("current")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetCurrentSubscription()
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0)
                    return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                var subscription = await _subscriptionService.GetCurrentSubscriptionAsync(tenantId);

                if (subscription == null)
                    return Ok(ApiResponse<object>.Ok(null, "Aktif abonelik bulunamadi."));

                return Ok(ApiResponse<CurrentSubscriptionDto>.Ok(subscription));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Abonelik durumunu kontrol eder.
        /// [Owner] JWT gerekli
        /// GET /api/subscription/status
        /// </summary>
        [HttpGet("status")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0)
                    return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                var isActive   = await _subscriptionService.IsSubscriptionActiveAsync(tenantId);
                var isInTrial  = await _subscriptionService.IsInTrialPeriodAsync(tenantId);

                return Ok(ApiResponse<object>.Ok(new
                {
                    IsActive       = isActive,
                    IsInTrialPeriod= isInTrial
                }));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Abonelik satin alma - PayTR IFRAME token doner.
        /// [Owner] JWT gerekli
        /// POST /api/subscription/purchase
        ///
        /// Yanit: IframeToken, IframeUrl, MerchantOid
        /// Frontend IframeUrl ile iframe olusturur:
        ///   iframe src = IframeUrl
        /// </summary>
        [HttpPost("purchase")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Purchase([FromBody] SubscriptionPurchaseDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0)
                    return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                var userIp = GetClientIp();
                var result = await _subscriptionService.PurchaseSubscriptionAsync(tenantId, dto, userIp);

                return Ok(ApiResponse<SubscriptionPurchaseResultDto>.Ok(
                    result,
                    "PayTR odeme formu hazir. IframeUrl kullanarak odeme iframe'ini gosterin."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Deneme suresi baslatma (ilk kayit sonrasi 7 gun ucretsiz).
        /// [Owner] JWT gerekli
        /// POST /api/subscription/start-trial
        /// Body: planId (int)
        /// </summary>
        [HttpPost("start-trial")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> StartTrial([FromBody] int planId)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0)
                    return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                var subscription = await _subscriptionService.CreateTrialSubscriptionAsync(tenantId, planId);
                return Ok(ApiResponse<object>.Ok(
                    new { SubscriptionId = subscription.Id, EndDate = subscription.EndDate },
                    "7 gunluk deneme sureniz baslatildi!"));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Abonelik iptal etme.
        /// [Owner] JWT gerekli
        /// POST /api/subscription/cancel
        /// </summary>
        [HttpPost("cancel")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> Cancel([FromBody] CancelSubscriptionDto dto)
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0)
                    return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                var success = await _subscriptionService.CancelSubscriptionAsync(tenantId, dto);

                if (success)
                {
                    var message = dto.RequestRefund
                        ? "Aboneliginiz iptal edildi ve iade islemi baslatildi."
                        : "Aboneliginiz iptal edildi. Mevcut donem sonuna kadar kullanmaya devam edebilirsiniz.";

                    return Ok(ApiResponse<object>.Ok(true, message));
                }

                return BadRequest(ApiResponse<object>.Fail("Abonelik iptal edilemedi."));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Odeme gecmisini listeler.
        /// [Owner] JWT gerekli
        /// GET /api/subscription/payment-history
        /// </summary>
        [HttpGet("payment-history")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetPaymentHistory()
        {
            try
            {
                var tenantId = GetTenantId();
                if (tenantId == 0)
                    return BadRequest(ApiResponse<object>.Fail("Tenant ID bulunamadi."));

                var history = await _subscriptionService.GetPaymentHistoryAsync(tenantId);
                return Ok(ApiResponse<List<PaymentHistoryDto>>.Ok(history));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }

        /// <summary>
        /// Belirli bir odemenin PayTR durum sorgusunu yapar.
        /// [Owner] JWT gerekli
        /// GET /api/subscription/payment-status/{merchantOid}
        /// </summary>
        [HttpGet("payment-status/{merchantOid}")]
        [Authorize(Roles = "Owner")]
        public async Task<IActionResult> GetPaymentStatus(string merchantOid)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(merchantOid))
                    return BadRequest(ApiResponse<object>.Fail("MerchantOid bos olamaz."));

                var result = await _subscriptionService
                    .GetPaymentHistoryAsync(GetTenantId()); // Sahiplik kontrolu

                // Verilen merchantOid bu tenant'a ait mi kontrol et
                var owns = result.Any(ph => ph.MerchantOid == merchantOid);
                if (!owns)
                    return Forbid();

                // PayTR'dan canli durum sor (IPaymentService'e erisim icin controller'a inject edilebilir)
                return Ok(ApiResponse<object>.Ok(new { MerchantOid = merchantOid, Message = "Durum sorgusu icin GET /api/paymentcallback/status/{merchantOid} endpoint'ini kullanin." }));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResponse<object>.Fail("İşlem sırasında bir hata oluştu."));
            }
        }
    }
}
