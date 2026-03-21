using API_BeautyWise.DTO;
using API_BeautyWise.Models;
using API_BeautyWise.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Security.Cryptography;
using System.Text;

namespace API_BeautyWise.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly Context _context;
        private readonly IConfiguration _configuration;
        private readonly LogService _logService;
        private readonly IHttpClientFactory _httpClientFactory;

        // PayTR API endpoint'leri
        private const string PAYTR_GET_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";
        private const string PAYTR_REFUND_URL    = "https://www.paytr.com/odeme/iade";
        private const string PAYTR_STATUS_URL    = "https://www.paytr.com/odeme/durum-sorgu";
        private const string PAYTR_IFRAME_URL    = "https://www.paytr.com/odeme/guvenli/";

        public PaymentService(
            Context context,
            IConfiguration configuration,
            LogService logService,
            IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _configuration = configuration;
            _logService = logService;
            _httpClientFactory = httpClientFactory;
        }

        // ================================================================
        //  YARDIMCI: Config okuma
        // ================================================================
        private string Cfg(string key) => _configuration[$"PayTR:{key}"] ?? "";

        // ================================================================
        //  YARDIMCI: HMAC-SHA256 Token hesaplama
        //  PayTR tum API isteklerinde bu yontemi kullanir.
        // ================================================================
        private string ComputeHmacSha256(string data, string key)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return Convert.ToBase64String(hash);
        }

        // ================================================================
        //  ADIM 1: IFRAME Token Alma
        //  Abonelik odeme sayfasi acilmadan once cagrilir.
        //  Donen IframeToken frontend'e verilir, iframe embed edilir.
        // ================================================================
        public async Task<PaymentInitializeResultDto> InitializePaymentAsync(
            int tenantId, int subscriptionId, decimal amount, string userIp)
        {
            try
            {
                var tenant = await _context.Tenants.FindAsync(tenantId);
                var subscription = await _context.TenantSubscriptions
                    .Include(s => s.SubscriptionPlan)
                    .FirstOrDefaultAsync(s => s.Id == subscriptionId);

                if (tenant == null || subscription == null)
                    throw new Exception("TENANT_OR_SUBSCRIPTION_NOT_FOUND|Tenant veya abonelik bulunamadi.");

                var owner = await _context.Users
                    .FirstOrDefaultAsync(u => u.TenantId == tenantId);

                if (owner == null)
                    throw new Exception("OWNER_NOT_FOUND|Tenant sahibi bulunamadi.");

                // Benzersiz siparis numarasi (max 64 karakter, alfanumerik)
                var merchantOid = $"BW{subscriptionId}{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

                // Sepet bilgisi (Base64 JSON)
                var basketItems = new object[][]
                {
                    new object[]
                    {
                        subscription.SubscriptionPlan.Name + " Abonelik",
                        amount.ToString("F2", System.Globalization.CultureInfo.InvariantCulture),
                        1
                    }
                };
                var basketJson  = JsonConvert.SerializeObject(basketItems);
                var userBasket  = Convert.ToBase64String(Encoding.UTF8.GetBytes(basketJson));

                // Tutar kuruse cevir (PayTR gereksimi: 299.90 TL -> 29990)
                var paymentAmount = ((int)Math.Round(amount * 100)).ToString();

                var merchantId    = Cfg("MerchantId");
                var merchantKey   = Cfg("MerchantKey");
                var merchantSalt  = Cfg("MerchantSalt");
                var testMode      = Cfg("TestMode");
                var debugOn       = Cfg("DebugOn");
                var noInstallment = Cfg("NoInstallment");
                var maxInstallment= Cfg("MaxInstallment");
                var currency      = Cfg("Currency");
                var timeoutLimit  = Cfg("TimeoutLimit");
                var lang          = Cfg("Lang");
                var successUrl    = Cfg("SuccessUrl");
                var failUrl       = Cfg("FailUrl");
                var callbackUrl   = Cfg("CallbackUrl");

                var email       = owner.Email ?? "";
                var userName    = $"{owner.Name} {owner.Surname}".Trim();
                var userPhone   = tenant.Phone ?? "";
                var userAddress = tenant.Address ?? "Adres bilgisi girilmemis";

                // HMAC-SHA256 Token
                // merchantId + userIp + merchantOid + email + paymentAmount +
                // userBasket + noInstallment + maxInstallment + currency + testMode + merchantSalt
                var hashInput = string.Concat(
                    merchantId, userIp, merchantOid, email,
                    paymentAmount, userBasket,
                    noInstallment, maxInstallment, currency, testMode,
                    merchantSalt);
                var paytrToken = ComputeHmacSha256(hashInput, merchantKey);

                var postData = new Dictionary<string, string>
                {
                    ["merchant_id"]       = merchantId,
                    ["user_ip"]           = userIp,
                    ["merchant_oid"]      = merchantOid,
                    ["email"]             = email,
                    ["payment_amount"]    = paymentAmount,
                    ["user_basket"]       = userBasket,
                    ["paytr_token"]       = paytrToken,
                    ["debug_on"]          = debugOn,
                    ["test_mode"]         = testMode,
                    ["no_installment"]    = noInstallment,
                    ["max_installment"]   = maxInstallment,
                    ["user_name"]         = userName,
                    ["user_address"]      = userAddress,
                    ["user_phone"]        = userPhone,
                    ["merchant_ok_url"]   = successUrl,
                    ["merchant_fail_url"] = failUrl,
                    ["callback_link"]     = callbackUrl,
                    ["timeout_limit"]     = timeoutLimit,
                    ["currency"]          = currency,
                    ["lang"]              = lang
                };

                var client      = _httpClientFactory.CreateClient("PayTR");
                var content     = new FormUrlEncodedContent(postData);
                var response    = await client.PostAsync(PAYTR_GET_TOKEN_URL, content);
                var responseBody= await response.Content.ReadAsStringAsync();
                var json        = JObject.Parse(responseBody);
                var status      = json["status"]?.ToString();

                if (status != "success")
                {
                    var reason = json["reason"]?.ToString() ?? "Bilinmeyen PayTR hatasi";
                    throw new Exception($"PAYTR_TOKEN_ERROR|{reason}");
                }

                var iframeToken = json["token"]!.ToString();

                // merchant_oid abonelik kaydina yazilir (iade icin gerekli)
                subscription.PaymentToken = merchantOid;
                await _context.SaveChangesAsync();

                await SavePaymentHistoryAsync(
                    tenantId, subscriptionId, amount, "Pending",
                    merchantOid: merchantOid);

                return new PaymentInitializeResultDto
                {
                    IframeToken = iframeToken,
                    IframeUrl   = PAYTR_IFRAME_URL + iframeToken,
                    MerchantOid = merchantOid
                };
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception  = ex,
                    LogLevel   = LogLevel.Error,
                    StatusCode = 500,
                    Action     = nameof(InitializePaymentAsync),
                    Controller = nameof(PaymentService),
                    Endpoint   = "PaymentService.InitializePaymentAsync",
                    Timestamp  = DateTime.Now,
                    UserId     = null
                });
                throw;
            }
        }

        // ================================================================
        //  ADIM 2: PayTR Callback (Bildirim URL)
        //  PayTR sunucudan sunucuya POST eder.
        //  Yanit olarak duz metin "OK" donulmeli.
        // ================================================================
        public async Task<PaymentCallbackResultDto> HandlePaymentCallbackAsync(PayTrCallbackDto dto)
        {
            try
            {
                var merchantKey  = Cfg("MerchantKey");
                var merchantSalt = Cfg("MerchantSalt");

                // Hash dogrulama: merchantOid + merchantSalt + status + totalAmount
                var hashInput    = string.Concat(dto.MerchantOid, merchantSalt, dto.Status, dto.TotalAmount);
                var expectedHash = ComputeHmacSha256(hashInput, merchantKey);

                if (dto.Hash != expectedHash)
                {
                    await _logService.LogErrorAsync(new LogErrorDto
                    {
                        Exception  = new Exception("PayTR hash dogrulamasi basarisiz."),
                        LogLevel   = LogLevel.Warning,
                        StatusCode = 400,
                        Action     = nameof(HandlePaymentCallbackAsync),
                        Controller = nameof(PaymentService),
                        Endpoint   = "POST /api/paymentcallback/paytr",
                        Timestamp  = DateTime.Now,
                        UserId     = null
                    });

                    return new PaymentCallbackResultDto
                    {
                        Success       = false,
                        Message       = "Hash dogrulama hatasi.",
                        PaymentStatus = "HashError"
                    };
                }

                // merchant_oid ile aboneligi bul (PaymentToken alaninda sakli)
                var subscription = await _context.TenantSubscriptions
                    .FirstOrDefaultAsync(s => s.PaymentToken == dto.MerchantOid);

                if (subscription == null)
                {
                    return new PaymentCallbackResultDto
                    {
                        Success       = false,
                        Message       = $"Abonelik bulunamadi. MerchantOid: {dto.MerchantOid}",
                        PaymentStatus = "NotFound"
                    };
                }

                if (dto.Status == "success")
                {
                    subscription.IsActive             = true;
                    subscription.PaymentStatus        = "Paid";
                    subscription.PaymentTransactionId = dto.TotalAmount;
                    subscription.UDate                = DateTime.Now;

                    decimal totalAmountDecimal = 0;
                    if (decimal.TryParse(dto.TotalAmount, out var amt))
                        totalAmountDecimal = amt / 100;

                    await SavePaymentHistoryAsync(
                        subscription.TenantId,
                        subscription.Id,
                        totalAmountDecimal,
                        "Success",
                        merchantOid: dto.MerchantOid);
                }
                else
                {
                    subscription.PaymentStatus = "Failed";
                    subscription.UDate         = DateTime.Now;

                    await SavePaymentHistoryAsync(
                        subscription.TenantId,
                        subscription.Id,
                        0,
                        "Failed",
                        merchantOid: dto.MerchantOid);
                }

                await _context.SaveChangesAsync();

                return new PaymentCallbackResultDto
                {
                    Success        = dto.Status == "success",
                    Message        = dto.Status == "success" ? "Odeme basarili." : $"Odeme basarisiz: {dto.FailedReasonMsg}",
                    SubscriptionId = subscription.Id,
                    PaymentStatus  = dto.Status == "success" ? "Paid" : "Failed"
                };
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception  = ex,
                    LogLevel   = LogLevel.Error,
                    StatusCode = 500,
                    Action     = nameof(HandlePaymentCallbackAsync),
                    Controller = nameof(PaymentService),
                    Endpoint   = "POST /api/paymentcallback/paytr",
                    Timestamp  = DateTime.Now,
                    UserId     = null
                });

                return new PaymentCallbackResultDto
                {
                    Success       = false,
                    Message       = "Callback islenirken hata olustu.",
                    PaymentStatus = "Error"
                };
            }
        }

        // ================================================================
        //  IADE Islemi
        // ================================================================
        public async Task<PaymentRefundResultDto> ProcessRefundAsync(
            int subscriptionId, decimal refundAmount, string reason)
        {
            try
            {
                var subscription = await _context.TenantSubscriptions.FindAsync(subscriptionId);
                if (subscription == null)
                    return new PaymentRefundResultDto { Success = false, Message = "Abonelik bulunamadi." };

                var merchantOid = subscription.PaymentToken;
                if (string.IsNullOrEmpty(merchantOid))
                    return new PaymentRefundResultDto { Success = false, Message = "Bu aboneliğe ait odeme kaydi bulunamadi." };

                var merchantId   = Cfg("MerchantId");
                var merchantKey  = Cfg("MerchantKey");
                var merchantSalt = Cfg("MerchantSalt");

                var returnAmountStr = refundAmount.ToString("F2", System.Globalization.CultureInfo.InvariantCulture);

                // HMAC-SHA256: merchantId + merchantOid + returnAmount + merchantSalt
                var hashInput  = string.Concat(merchantId, merchantOid, returnAmountStr, merchantSalt);
                var paytrToken = ComputeHmacSha256(hashInput, merchantKey);

                var postData = new Dictionary<string, string>
                {
                    ["merchant_id"]   = merchantId,
                    ["merchant_oid"]  = merchantOid,
                    ["return_amount"] = returnAmountStr,
                    ["paytr_token"]   = paytrToken
                };

                var client   = _httpClientFactory.CreateClient("PayTR");
                var content  = new FormUrlEncodedContent(postData);
                var response = await client.PostAsync(PAYTR_REFUND_URL, content);
                var body     = await response.Content.ReadAsStringAsync();
                var json     = JObject.Parse(body);
                var status   = json["status"]?.ToString();

                if (status == "success")
                {
                    var referenceNo = json["reference_no"]?.ToString();
                    var isTest      = json["is_test"]?.ToString() == "1";

                    var paymentHistory = await _context.TenantPaymentHistories
                        .FirstOrDefaultAsync(ph => ph.SubscriptionId == subscriptionId
                                                && ph.PaymentStatus == "Success");
                    if (paymentHistory != null)
                    {
                        paymentHistory.IsRefunded    = true;
                        paymentHistory.RefundAmount  = refundAmount;
                        paymentHistory.RefundDate    = DateTime.Now;
                        paymentHistory.RefundReason  = reason;
                        paymentHistory.PaymentStatus = "Refunded";
                        paymentHistory.UDate         = DateTime.Now;
                    }

                    await _context.SaveChangesAsync();

                    return new PaymentRefundResultDto
                    {
                        Success      = true,
                        Message      = "Iade islemi basariyla tamamlandi.",
                        MerchantOid  = merchantOid,
                        RefundAmount = refundAmount,
                        ReferenceNo  = referenceNo,
                        IsTest       = isTest
                    };
                }
                else
                {
                    var errMsg = json["err_msg"]?.ToString() ?? "Bilinmeyen PayTR iade hatasi";
                    return new PaymentRefundResultDto
                    {
                        Success = false,
                        Message = $"PayTR iade hatasi: {errMsg}"
                    };
                }
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception  = ex,
                    LogLevel   = LogLevel.Error,
                    StatusCode = 500,
                    Action     = nameof(ProcessRefundAsync),
                    Controller = nameof(PaymentService),
                    Endpoint   = "PaymentService.ProcessRefundAsync",
                    Timestamp  = DateTime.Now,
                    UserId     = null
                });

                return new PaymentRefundResultDto
                {
                    Success = false,
                    Message = "Iade islemi sirasinda hata olustu."
                };
            }
        }

        // ================================================================
        //  DURUM SORGULAMA
        // ================================================================
        public async Task<PaymentStatusResultDto> QueryPaymentStatusAsync(string merchantOid)
        {
            try
            {
                var merchantId   = Cfg("MerchantId");
                var merchantKey  = Cfg("MerchantKey");
                var merchantSalt = Cfg("MerchantSalt");

                // HMAC-SHA256: merchantId + merchantOid + merchantSalt
                var hashInput  = string.Concat(merchantId, merchantOid, merchantSalt);
                var paytrToken = ComputeHmacSha256(hashInput, merchantKey);

                var postData = new Dictionary<string, string>
                {
                    ["merchant_id"]  = merchantId,
                    ["merchant_oid"] = merchantOid,
                    ["paytr_token"]  = paytrToken
                };

                var client   = _httpClientFactory.CreateClient("PayTR");
                var content  = new FormUrlEncodedContent(postData);
                var response = await client.PostAsync(PAYTR_STATUS_URL, content);
                var body     = await response.Content.ReadAsStringAsync();
                var json     = JObject.Parse(body);
                var status   = json["status"]?.ToString();

                if (status == "success")
                {
                    decimal? paymentAmount = null;
                    if (decimal.TryParse(json["payment_amount"]?.ToString(), out var rawAmt))
                        paymentAmount = rawAmt / 100;

                    decimal? paymentTotal = null;
                    if (decimal.TryParse(json["payment_total"]?.ToString(), out var rawTotal))
                        paymentTotal = rawTotal / 100;

                    var returnItems  = new List<PaymentReturnItemDto>();
                    var returnsArray = json["returns"] as JArray;
                    if (returnsArray != null)
                    {
                        foreach (var item in returnsArray)
                        {
                            decimal itemAmt = 0;
                            if (decimal.TryParse(item["amount"]?.ToString(), out var rawItemAmt))
                                itemAmt = rawItemAmt / 100;

                            returnItems.Add(new PaymentReturnItemDto
                            {
                                Amount        = itemAmt,
                                Date          = item["date"]?.ToString(),
                                Type          = item["type"]?.ToString(),
                                DateCompleted = item["date_completed"]?.ToString(),
                                AuthCode      = item["auth_code"]?.ToString(),
                                RefNum        = item["ref_num"]?.ToString()
                            });
                        }
                    }

                    return new PaymentStatusResultDto
                    {
                        Success              = true,
                        MerchantOid          = merchantOid,
                        PaymentAmount        = paymentAmount,
                        CustomerPaymentTotal = paymentTotal,
                        Currency             = json["currency"]?.ToString(),
                        Returns              = returnItems
                    };
                }
                else
                {
                    return new PaymentStatusResultDto
                    {
                        Success      = false,
                        MerchantOid  = merchantOid,
                        ErrorNo      = json["err_no"]?.ToString(),
                        ErrorMessage = json["err_msg"]?.ToString()
                    };
                }
            }
            catch (Exception ex)
            {
                await _logService.LogErrorAsync(new LogErrorDto
                {
                    Exception  = ex,
                    LogLevel   = LogLevel.Error,
                    StatusCode = 500,
                    Action     = nameof(QueryPaymentStatusAsync),
                    Controller = nameof(PaymentService),
                    Endpoint   = "PaymentService.QueryPaymentStatusAsync",
                    Timestamp  = DateTime.Now,
                    UserId     = null
                });

                return new PaymentStatusResultDto
                {
                    Success      = false,
                    MerchantOid  = merchantOid,
                    ErrorMessage = "Durum sorgulanirken hata olustu."
                };
            }
        }

        // ================================================================
        //  Odeme Gecmisi Kaydetme
        // ================================================================
        public async Task<bool> SavePaymentHistoryAsync(
            int tenantId,
            int subscriptionId,
            decimal amount,
            string status,
            string? merchantOid = null,
            string? payTrReferenceNo = null)
        {
            try
            {
                var subscription = await _context.TenantSubscriptions
                    .Include(s => s.SubscriptionPlan)
                    .FirstOrDefaultAsync(s => s.Id == subscriptionId);

                // Ayni merchantOid ile "Pending" kayit varsa guncelle
                var existing = merchantOid != null
                    ? await _context.TenantPaymentHistories
                        .FirstOrDefaultAsync(ph => ph.TransactionId == merchantOid
                                                && ph.PaymentStatus == "Pending")
                    : null;

                if (existing != null)
                {
                    existing.PaymentStatus = status;
                    existing.PaymentId     = payTrReferenceNo;
                    existing.Amount        = amount > 0 ? amount : existing.Amount;
                    existing.UDate         = DateTime.Now;
                }
                else
                {
                    var history = new TenantPaymentHistory
                    {
                        TenantId       = tenantId,
                        SubscriptionId = subscriptionId,
                        Amount         = amount,
                        PaymentDate    = DateTime.Now,
                        PaymentStatus  = status,
                        PaymentMethod  = "CreditCard",
                        Description    = subscription != null
                            ? $"{subscription.SubscriptionPlan.Name} Abonelik Odemesi"
                            : "Abonelik Odemesi",
                        TransactionId  = merchantOid,       // MerchantOid bu alanda
                        PaymentId      = payTrReferenceNo,  // PayTR referans no
                        CDate          = DateTime.Now,
                        IsActive       = true
                    };
                    _context.TenantPaymentHistories.Add(history);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
