# 🚀 BeautyWise API - Postman Collection

Aşağıda projedeki tüm endpoint'ler ve request body örnekleri listelenmiştir. Bu bilgileri kullanarak Postman koleksiyonunuzu oluşturabilirsiniz.

---

## 🔐 Auth & Onboarding (Kimlik Doğrulama)

### 1. Personel Girişi (Login)
**Method:** `POST`  
**URL:** `{{base_url}}/api/auth/login`

**Body (JSON):**
```json
{
  "emailOrUsername": "staff@beautywise.com",
  "password": "Password123!"
}
```

### 2. Personel Kaydı (Register - Davet Kodu ile)
**Method:** `POST`  
**URL:** `{{base_url}}/api/auth/register`

**Body (JSON):**
```json
{
  "inviteToken": "INV-123456",
  "email": "newstaff@beautywise.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "name": "Ahmet",
  "surname": "Yılmaz",
  "birthDate": "1995-05-15T00:00:00"
}
```

### 3. Firma Kaydı (Tenant Register - İlk Kayıt)
**Method:** `POST`  
**URL:** `{{base_url}}/api/tenantonboarding/register-tenant`

**Body (JSON):**
```json
{
  "companyName": "Güzellik Merkezi A.Ş.",
  "phone": "5551234567",
  "address": "Bağdat Caddesi No:1, Kadıköy, İstanbul",
  "taxNumber": "1234567890",
  "taxOffice": "Kadıköy",
  "email": "owner@beautywise.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "name": "Mehmet",
  "surname": "Kara"
}
```

### 4. Personel Davet Kodu Oluşturma (Owner Only)
**Method:** `POST`  
**URL:** `{{base_url}}/api/tenantonboarding/invite-token`
**Header:** `Authorization: Bearer <TOKEN>`

**Body (JSON):**
```json
"invite-email@example.com"
```
*(Not: Body direkt string olarak gönderilir)*

---

## 📦 Abonelik Yönetimi (Subscription - Owner)

### 5. Abonelik Paketlerini Listele
**Method:** `GET`  
**URL:** `{{base_url}}/api/subscription/plans`

### 6. Mevcut Abonelik Bilgisi
**Method:** `GET`  
**URL:** `{{base_url}}/api/subscription/current`
**Header:** `Authorization: Bearer <TOKEN>`

### 7. Abonelik Satın Alma
**Method:** `POST`  
**URL:** `{{base_url}}/api/subscription/purchase`
**Header:** `Authorization: Bearer <TOKEN>`

**Body (JSON):**
```json
{
  "subscriptionPlanId": 2,
  "isYearly": false,
  "couponCode": "HOSGELDIN2026" 
}
```
*(Not: `couponCode` opsiyoneldir, `isYearly: true` ise yıllık fiyattan hesaplanır)*

### 8. Abonelik İptal Etme
**Method:** `POST`  
**URL:** `{{base_url}}/api/subscription/cancel`
**Header:** `Authorization: Bearer <TOKEN>`

**Body (JSON):**
```json
{
  "reason": "Artık ihtiyacım kalmadı",
  "requestRefund": false 
}
```
*(Not: `requestRefund: true` ise iade talebi oluşturulur)*

### 9. Deneme Süresi Başlatma (İlk Kez)
**Method:** `POST`  
**URL:** `{{base_url}}/api/subscription/start-trial`
**Header:** `Authorization: Bearer <TOKEN>`

**Body (JSON):**
```json
2 
```
*(Not: Body olarak sadece Plan ID (int) gönderilir)*

### 10. Abonelik Durumu Kontrolü
**Method:** `GET`  
**URL:** `{{base_url}}/api/subscription/status`
**Header:** `Authorization: Bearer <TOKEN>`

---

## 🛠️ Admin - Abonelik Planı Yönetimi (Sadece Admin)

### 11. Tüm Planları Listele
**Method:** `GET`  
**URL:** `{{base_url}}/api/admin/subscriptionplan`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

### 12. Plan Detayı Getir
**Method:** `GET`  
**URL:** `{{base_url}}/api/admin/subscriptionplan/{id}`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

### 13. Yeni Plan Oluştur
**Method:** `POST`  
**URL:** `{{base_url}}/api/admin/subscriptionplan`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

**Body (JSON):**
```json
{
  "name": "Platin Paket",
  "monthlyPrice": 2000,
  "yearlyPrice": 20000,
  "maxStaffCount": -1,
  "maxBranchCount": 5,
  "hasSmsIntegration": true,
  "hasAiFeatures": true
}
```
*(Not: `-1` sınırsız anlamına gelir)*

### 14. Plan Güncelle
**Method:** `PUT`  
**URL:** `{{base_url}}/api/admin/subscriptionplan/{id}`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

**Body (JSON):**
```json
{
  "name": "Platin Paket (Güncel)",
  "monthlyPrice": 2500,
  "yearlyPrice": 25000,
  "maxStaffCount": -1,
  "maxBranchCount": 10,
  "hasSmsIntegration": true,
  "hasAiFeatures": true
}
```

### 15. Plan Sil (Soft Delete)
**Method:** `DELETE`  
**URL:** `{{base_url}}/api/admin/subscriptionplan/{id}`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

---

## 🎟️ Admin - Kupon Yönetimi (Sadece Admin)

### 16. Tüm Kuponları Listele
**Method:** `GET`  
**URL:** `{{base_url}}/api/admin/coupon`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

### 17. Kupon Detayı Getir
**Method:** `GET`  
**URL:** `{{base_url}}/api/admin/coupon/{id}`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

### 18. Yeni Kupon Oluştur
**Method:** `POST`  
**URL:** `{{base_url}}/api/admin/coupon`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

**Body (JSON):**
```json
{
  "code": "YAZ2026",
  "description": "Yaz kampanyası %20 indirim",
  "isPercentage": true,
  "discountAmount": 20,
  "startDate": "2026-06-01T00:00:00",
  "endDate": "2026-09-01T00:00:00",
  "maxUsageCount": 100,
  "isGlobal": true,
  "specificTenantId": null
}
```

### 19. Kupon Güncelle
**Method:** `PUT`  
**URL:** `{{base_url}}/api/admin/coupon/{id}`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

**Body (JSON):**
```json
{
  "code": "KIS2026",
  "description": "Kış kampanyası düzeltme",
  "isPercentage": false,
  "discountAmount": 100,
  "startDate": "2026-12-01T00:00:00",
  "endDate": "2027-03-01T00:00:00",
  "maxUsageCount": 50,
  "isGlobal": true,
  "specificTenantId": null
}
```

### 20. Kupon Sil (Soft Delete)
**Method:** `DELETE`  
**URL:** `{{base_url}}/api/admin/coupon/{id}`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

### 21. Kupon Doğrulama (Test)
**Method:** `POST`  
**URL:** `{{base_url}}/api/admin/coupon/validate`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`

**Body (JSON):**
```json
{
  "code": "YAZ2026",
  "tenantId": 15,
  "originalPrice": 1000
}
```

---

## 💳 Ödeme (Payment)

### 22. Iyzico Callback (Iyzico Çağırır)
**Method:** `POST`  
**URL:** `{{base_url}}/api/paymentcallback/iyzico`

**Body (Form Data):**
- `token`: `payment_token_string`

### 23. Ödeme Durumu Sorgula (Test)
**Method:** `GET`  
**URL:** `{{base_url}}/api/paymentcallback/status/{token}`

---

## 📝 Ortam Değişkenleri (Environment Variables)

Postman'de `Development` ve `Production` ortamları oluşturup şu değişkeni tanımlayabilirsiniz:

- `base_url`: `https://localhost:7001` (veya port kaç ise)

Token almak için önce `/api/auth/login` veya `/api/tenantonboarding/register-tenant` endpoint'ini kullanın. Dönen response içindeki token'ı kopyalayıp Authorization sekmesinde `Bearer Token` olarak ekleyin.
