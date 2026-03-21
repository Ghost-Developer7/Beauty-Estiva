# BeautyWise API — Frontend Geliştirici Dokümantasyonu

> **Son güncelleme:** 2026-03-10
> **Base URL:** `https://DOMAIN_GIRINIZ` (geliştirme: `https://localhost:5001`)
> **Swagger UI:** `{BaseUrl}/swagger`

---

## İçindekiler

1. [Genel Bilgiler](#genel-bilgiler)
2. [Kimlik Doğrulama (Auth)](#kimlik-doğrulama)
3. [Güzellik Merkezi Kaydı (Tenant Onboarding)](#güzellik-merkezi-kaydı)
4. [Abonelik Yönetimi](#abonelik-yönetimi)
5. [PayTR Ödeme Entegrasyonu](#paytr-ödeme-entegrasyonu)
6. [Personel Yönetimi](#personel-yönetimi)
7. [Kupon Sistemi](#kupon-sistemi)
8. [Hata Yanıtları](#hata-yanıtları)

---

## Genel Bilgiler

### Yanıt Formatı

Tüm başarılı yanıtlar aynı formattadır:

```json
{
  "success": true,
  "data": { ... },
  "message": "İşlem başarılı.",
  "error": null
}
```

Hata yanıtı:
```json
{
  "success": false,
  "data": null,
  "message": null,
  "error": {
    "errorCode": "HATA_KODU",
    "message": "Hata açıklaması."
  }
}
```

### Authorization Header

JWT gerektiren endpoint'lerde:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token 30 gün geçerlidir.

### Roller

| Rol | Açıklama |
|-----|----------|
| `Owner` | Güzellik merkezi sahibi. Abonelik, ödeme, personel yönetimi yapabilir. |
| `Staff` | Personel. Davet kodu ile kayıt olur. |
| `Admin` | Platform yöneticisi. Planları ve kuponları yönetir. |

---

## Kimlik Doğrulama

### Giriş

```
POST /api/auth/login
```

**İstek:**
```json
{
  "emailOrUsername": "owner@salon.com",
  "password": "Sifre123!"
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "name": "Ayşe",
    "surname": "Yılmaz",
    "email": "owner@salon.com",
    "roles": ["Owner"]
  }
}
```

> **Not:** Token'ı localStorage veya sessionStorage'a kaydedin ve her istekte `Authorization: Bearer {token}` olarak gönderin.

---

### Personel Kaydı (Davet Kodu ile)

```
POST /api/auth/register
```

**İstek:**
```json
{
  "inviteToken": "ABCD123456",
  "email": "personel@salon.com",
  "password": "Sifre123!",
  "confirmPassword": "Sifre123!",
  "name": "Fatma",
  "surname": "Demir",
  "birthDate": "1995-06-15"
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": 42,
  "message": null
}
```
> `data` değeri oluşturulan kullanıcının ID'sidir.

**Şifre Kuralları:**
- Minimum 8 karakter
- En az 1 büyük harf
- En az 1 küçük harf
- En az 1 rakam
- En az 1 özel karakter (`!`, `@`, `#`, vb.)

---

## Güzellik Merkezi Kaydı

### Tenant Kaydı (Güzellik Merkezi Açma)

```
POST /api/tenantonboarding/register-tenant
```

**İstek:**
```json
{
  "companyName": "Güzellik Salonu Ayşe",
  "phone": "05551234567",
  "address": "Bağcılar Mah. No:15 İstanbul",
  "taxNumber": "1234567890",
  "taxOffice": "Bağcılar",
  "email": "owner@salon.com",
  "password": "Sifre123!",
  "confirmPassword": "Sifre123!",
  "name": "Ayşe",
  "surname": "Yılmaz"
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "tenantId": 12,
    "userId": 45
  },
  "message": "Kayit basarili. Lutfen giris yaparak sistemi kullanmaya baslayin."
}
```

**Sonraki adım:** `/api/auth/login` ile giriş yapın.

---

### Personel Davet Kodu Oluşturma

```
POST /api/tenantonboarding/invite-token
Authorization: Bearer {token}    [Owner veya Admin]
```

**İstek:**
```json
"personel@salon.com"
```
> E-posta adresi belirtmek isteğe bağlıdır. `null` gönderilebilir.

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": "XK9P2M4QRT",
  "message": "Davet kodu olusturuldu. 24 saat icerisinde tek kullanimlik kullanilabilir."
}
```

> Dönen 10 karakterlik kodu personele iletin. Personel bu kodu `/api/auth/register` ile kullanır.

---

## Abonelik Yönetimi

### Paket Listesi

```
GET /api/subscription/plans
```
> Public endpoint — JWT gerekmez.

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Başlangıç",
      "monthlyPrice": 299.00,
      "yearlyPrice": 2990.00,
      "maxStaffCount": 3,
      "maxBranchCount": 1,
      "hasSmsIntegration": false,
      "hasAiFeatures": false
    },
    {
      "id": 2,
      "name": "Gold",
      "monthlyPrice": 599.00,
      "yearlyPrice": 5990.00,
      "maxStaffCount": 10,
      "maxBranchCount": 3,
      "hasSmsIntegration": true,
      "hasAiFeatures": false
    }
  ]
}
```

---

### Mevcut Abonelik

```
GET /api/subscription/current
Authorization: Bearer {token}    [Owner]
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "planName": "Gold",
    "priceSold": 599.00,
    "startDate": "2026-03-01T10:00:00",
    "endDate": "2026-04-01T10:00:00",
    "isTrialPeriod": false,
    "trialEndDate": null,
    "autoRenew": true,
    "paymentStatus": "Paid",
    "daysRemaining": 22,
    "isActive": true
  }
}
```

---

### Abonelik Durumu

```
GET /api/subscription/status
Authorization: Bearer {token}    [Owner]
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "isInTrialPeriod": false
  }
}
```

---

### Deneme Süresi Başlatma

```
POST /api/subscription/start-trial
Authorization: Bearer {token}    [Owner]
Content-Type: application/json
```

**İstek:**
```json
1
```
> Sadece planId gönderilir (integer).

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "subscriptionId": 5,
    "endDate": "2026-03-17T10:00:00"
  },
  "message": "7 gunluk deneme sureniz baslatildi!"
}
```

---

### Abonelik Satın Alma (PayTR IFRAME ile)

```
POST /api/subscription/purchase
Authorization: Bearer {token}    [Owner]
```

**İstek:**
```json
{
  "subscriptionPlanId": 2,
  "isYearly": false,
  "couponCode": "HOSGELDIN2026"
}
```
> `couponCode` opsiyoneldir, boş bırakılabilir.

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": {
    "subscriptionId": 8,
    "originalPrice": 599.00,
    "discountAmount": 59.90,
    "finalPrice": 539.10,
    "iframeToken": "abcdef1234567890abcdef",
    "iframeUrl": "https://www.paytr.com/odeme/guvenli/abcdef1234567890abcdef",
    "merchantOid": "BW8171234567890",
    "isTrialPeriod": false
  },
  "message": "PayTR odeme formu hazir. IframeUrl kullanarak odeme iframe'ini gosterin."
}
```

> **ÖNEMLİ:** `merchantOid` değerini saklayın! Ödeme durum sorgusu ve iade için gereklidir.

---

### Abonelik İptal

```
POST /api/subscription/cancel
Authorization: Bearer {token}    [Owner]
```

**İstek:**
```json
{
  "reason": "Fiyat yüksek buldum",
  "requestRefund": false
}
```
> `requestRefund: true` gönderilirse PayTR üzerinden iade işlemi başlatılır.

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": true,
  "message": "Aboneliginiz iptal edildi. Mevcut donem sonuna kadar kullanmaya devam edebilirsiniz."
}
```

---

### Ödeme Geçmişi

```
GET /api/subscription/payment-history
Authorization: Bearer {token}    [Owner]
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "amount": 539.10,
      "paymentDate": "2026-03-10T14:22:00",
      "paymentStatus": "Success",
      "paymentMethod": "CreditCard",
      "description": "Gold Abonelik Odemesi",
      "merchantOid": "BW8171234567890",
      "isRefunded": false,
      "refundAmount": null,
      "refundDate": null,
      "refundReason": null
    }
  ]
}
```

---

## PayTR Ödeme Entegrasyonu

### Genel Akış

```
                    FRONTEND                    BACKEND                    PayTR
                        │                          │                          │
 1. Kullanıcı "Ödeme    │                          │                          │
    Yap" butonuna basar │                          │                          │
                        │──POST /subscription/purchase──▶                     │
                        │                          │──POST get-token──────────▶
                        │                          │◀─── { token: "abc..." }──│
                        │◀─── { iframeUrl, ... } ──│                          │
                        │                          │                          │
 2. Frontend iframe     │                          │                          │
    oluşturur           │                          │                          │
    <iframe src=        │                          │                          │
    iframeUrl />        │──────────────────────────────────── iframe yükle ──▶│
                        │                          │                          │
 3. Kullanıcı kartını   │                          │                          │
    girer ve öder       │                          │                          │
                        │                          │◀── POST callback_link ───│
                        │                          │    (server-to-server)    │
                        │                          │──── "OK" response ──────▶│
                        │                          │                          │
                        │◀── window.location = ────────────────────────────────
                        │    success/fail URL                                  │
```

---

### Adım 1: IFRAME Oluşturma

`/api/subscription/purchase` yanıtından gelen `iframeUrl`'i bir `<iframe>` içinde gösterin:

```html
<!-- Örnek HTML -->
<div id="paytr-container">
  <iframe
    src="{iframeUrl}"
    id="paytriframe"
    frameborder="0"
    scrolling="no"
    style="width: 100%; min-height: 600px;"
  ></iframe>
</div>
```

```javascript
// React örneği
const PaymentFrame = ({ iframeUrl }) => {
  return (
    <iframe
      src={iframeUrl}
      style={{ width: '100%', minHeight: '600px', border: 'none' }}
      scrolling="no"
    />
  );
};
```

---

### Adım 2: Callback (Sunucu-Sunucu)

PayTR, ödeme tamamlandığında sunucumuza `POST /api/paymentcallback/paytr` isteği atar. **Frontend'in bu endpoint ile işi yoktur.** Backend otomatik olarak aboneliği aktif eder.

---

### Adım 3: Kullanıcı Yönlendirmesi

Ödeme sonrası PayTR kullanıcıyı `SuccessUrl` veya `FailUrl`'e yönlendirir (appsettings.json'da tanımlı).

```
Başarılı → http://localhost:3000/payment/success
Başarısız → http://localhost:3000/payment/fail
```

Bu sayfalarda kullanıcıya uygun mesaj gösterin. Abonelik aktifleşme durumunu kontrol etmek için:

```
GET /api/subscription/status
Authorization: Bearer {token}
```

---

### Ödeme Durumu Sorgulama

PayTR'dan anlık durum sorgusu için:

```
GET /api/paymentcallback/status/{merchantOid}
```

**Örnek:**
```
GET /api/paymentcallback/status/BW8171234567890
```

**Yanıt:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "merchantOid": "BW8171234567890",
    "paymentAmount": 539.10,
    "customerPaymentTotal": 539.10,
    "currency": "TL",
    "returns": []
  }
}
```

---

### Önemli Notlar - PayTR IFRAME

| Konu | Açıklama |
|------|----------|
| Test modu | `appsettings.json`'da `TestMode: "1"` iken test kartları kullanılabilir. |
| Timeout | Varsayılan 30 dakika. Bu süre içinde ödeme tamamlanmalı. |
| Taksit | Abonelik ödemeleri için taksit kapalıdır (`NoInstallment: "1"`). |
| İade | Ödeme sonrası kısmi/tam iade mümkündür (aşağıya bakın). |
| Tekrar deneme | Callback alınamazsa PayTR tekrar dener. `"OK"` yanıtı kritiktir. |

---

### PayTR Test Kartları

Test modunda (`TestMode: "1"`) aşağıdaki kartları kullanabilirsiniz:

| Kart No | Son Kullanma | CVV | Sonuç |
|---------|-------------|-----|-------|
| 4355 0843 5508 4358 | 12/26 | 000 | Başarılı |
| 5400 6190 0000 0002 | 12/26 | 000 | Başarılı |
| 4022 7749 8734 8272 | 12/26 | 000 | Başarısız |

> Daha fazla test kartı için [PayTR Panel](https://www.paytr.com) → Test İşlemleri bölümüne bakın.

---

## Personel Yönetimi

### Komple Personel Ekleme Akışı

```
1. Owner → POST /api/tenantonboarding/invite-token
   → Davet kodu alır (ör: "XK9P2M4QRT")

2. Owner → Davet kodunu personele iletir (e-posta, WhatsApp, vb.)

3. Personel → POST /api/auth/register
   Body: { inviteToken: "XK9P2M4QRT", email, password, name, surname }
   → Hesabı oluşturulur ve otomatik "Staff" rolü atanır.

4. Personel → POST /api/auth/login
   → JWT token alır.
```

---

## Kupon Sistemi

### Kupon Doğrulama (Satın Alma Sırasında)

Kupon kodu `/api/subscription/purchase` isteğinde `couponCode` alanı ile gönderilir. Geçersiz kupon durumunda hata mesajı döner.

**Hata örnekleri:**
```json
{
  "success": false,
  "error": {
    "errorCode": "INVALID_COUPON",
    "message": "Kupon gecerliligi dolmustur."
  }
}
```

---

## Hata Yanıtları

### Hata Kodları

| Kod | Açıklama |
|-----|----------|
| `PLAN_NOT_FOUND` | Seçilen abonelik planı bulunamadı. |
| `INVALID_COUPON` | Kupon geçersiz, süresi dolmuş veya kullanım limiti doldu. |
| `ACTIVE_SUBSCRIPTION_EXISTS` | Zaten aktif bir abonelik var. |
| `TRIAL_ALREADY_USED` | Deneme süresi daha önce kullanılmış. |
| `NO_ACTIVE_SUBSCRIPTION` | İptal için aktif abonelik bulunamadı. |
| `PAYTR_TOKEN_ERROR` | PayTR'dan token alınamadı. |
| `TENANT_OR_SUBSCRIPTION_NOT_FOUND` | Tenant veya abonelik kaydı bulunamadı. |
| `OWNER_NOT_FOUND` | Tenant sahibi bulunamadı. |
| `INVALID_INVITE_TOKEN` | Davet kodu geçersiz veya süresi dolmuş. |
| `PASSWORD_MISMATCH` | Şifreler eşleşmiyor. |
| `USER_CREATE_FAILED` | Kullanıcı oluşturma başarısız (detaylar mesajda). |
| `ERROR` | Genel hata. |

### HTTP Durum Kodları

| Kod | Durum |
|-----|-------|
| `200` | Başarılı |
| `400` | İstek hatalı (validasyon veya iş kuralı hatası) |
| `401` | Kimlik doğrulama gerekli (JWT yok veya geçersiz) |
| `403` | Erişim yasak (yetki yetersiz) |
| `500` | Sunucu hatası |

---

## Endpoint Özeti

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| POST | `/api/auth/login` | - | Giriş yap |
| POST | `/api/auth/register` | - | Personel kaydı (davet kodu) |
| POST | `/api/tenantonboarding/register-tenant` | - | Güzellik merkezi kaydı |
| POST | `/api/tenantonboarding/invite-token` | Owner | Personel davet kodu üret |
| GET | `/api/subscription/plans` | - | Paket listesi |
| GET | `/api/subscription/current` | Owner | Mevcut abonelik |
| GET | `/api/subscription/status` | Owner | Abonelik durumu |
| POST | `/api/subscription/start-trial` | Owner | Deneme süresi başlat |
| POST | `/api/subscription/purchase` | Owner | Abonelik satın al (PayTR) |
| POST | `/api/subscription/cancel` | Owner | Abonelik iptal |
| GET | `/api/subscription/payment-history` | Owner | Ödeme geçmişi |
| POST | `/api/paymentcallback/paytr` | - | PayTR callback (sunucu-sunucu) |
| GET | `/api/paymentcallback/status/{merchantOid}` | - | Ödeme durum sorgulama |

---

## Geliştirme Ortamı Kurulumu

1. `appsettings.json`'daki `PayTR` bölümüne kendi merchant bilgilerinizi girin.
2. `SuccessUrl` ve `FailUrl`'leri frontend URL'inize göre güncelleyin.
3. `CallbackUrl`'i internet üzerinden erişilebilir bir URL yapın (ngrok vb. kullanabilirsiniz).
4. `TestMode: "1"` ile başlayın, canlıya geçerken `"0"` yapın.

```json
"PayTR": {
  "MerchantId": "BURAYA_MERCHANT_ID",
  "MerchantKey": "BURAYA_MERCHANT_KEY",
  "MerchantSalt": "BURAYA_MERCHANT_SALT",
  "TestMode": "1",
  "SuccessUrl": "http://localhost:3000/payment/success",
  "FailUrl": "http://localhost:3000/payment/fail",
  "CallbackUrl": "https://abc.ngrok.io/api/paymentcallback/paytr"
}
```

---

*BeautyWise API Dokümantasyonu — Tüm hakları saklıdır.*
