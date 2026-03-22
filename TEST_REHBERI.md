# Beauty Estiva — Sıfırdan Test Rehberi

Bu rehber, tüm sistemi sıfırdan başlayarak uçtan uca test etmen için adım adım yol haritasıdır.

---

## 🔧 Ön Hazırlık

### 1. API'yi Başlat
```bash
cd API/API-BeautyWise
dotnet run
```
- API adresi: `http://localhost:5232` veya `https://localhost:7107`
- Swagger: `http://localhost:5232/swagger` (sadece Development'ta açık)

### 2. Frontend'i Başlat
```bash
cd estiva
npm run dev
```
- Frontend adresi: `http://localhost:3000`

### 3. Postman Hazırlığı
- Base URL değişkeni oluştur: `{{base}}` = `http://localhost:5232/api`
- Token değişkeni: `{{token}}` — login sonrası set edilecek

---

## AŞAMA 1: İşletme Kaydı (Tenant Onboarding)

### 1.1 — Postman: Salon Sahibi Kayıt
```
POST {{base}}/tenantonboarding/register-tenant
Content-Type: application/json

{
  "companyName": "Glow Atelier",
  "phone": "+90 555 123 4567",
  "address": "Kadıköy, İstanbul",
  "taxNumber": "1234567890",
  "taxOffice": "Kadıköy VD",
  "email": "owner@glowatelier.com",
  "password": "Owner123!",
  "confirmPassword": "Owner123!",
  "name": "Mehmet",
  "surname": "Kara"
}
```
✅ Beklenen: `{ "success": true, "data": { "tenantId": 1, "userId": 1 } }`

### 1.2 — Frontend: Aynı İşlemi UI'dan Test Et
1. `http://localhost:3000/signup` adresine git
2. Formu doldur (farklı e-posta kullan)
3. "Hesap Oluştur" butonuna tıkla
4. ✅ Başarı mesajı görün ve login sayfasına yönlendirin

---

## AŞAMA 2: Giriş (Login)

### 2.1 — Postman: Owner Login
```
POST {{base}}/auth/login
Content-Type: application/json

{
  "emailOrUsername": "owner@glowatelier.com",
  "password": "Owner123!"
}
```
✅ Beklenen: JWT token döner
📝 Token'ı kaydet: `{{token}}` değişkenine ata

### 2.2 — Frontend: Login Testi
1. `http://localhost:3000/login` adresine git
2. E-posta ve şifreyi gir
3. ✅ Dashboard'a yönlendirin
4. Sol menüde salon adını ve kullanıcı adını gör

### 2.3 — Hatalı Login Testi
- Yanlış şifre gir → ✅ Hata mesajı göster
- Boş form gönder → ✅ Validation hataları (kırmızı border + mesaj)

---

## AŞAMA 3: Hizmet Tanımlama (Treatments)

### 3.1 — Postman: Hizmet Oluştur
```
POST {{base}}/treatment
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Saç Boyama",
  "description": "Profesyonel saç boyama hizmeti",
  "durationMinutes": 90,
  "price": 500,
  "color": "#8b5cf6"
}
```
📝 Dönen ID'yi not al: `treatmentId = ?`

```
POST {{base}}/treatment

{
  "name": "Manikür",
  "durationMinutes": 45,
  "price": 200,
  "color": "#ec4899"
}
```

```
POST {{base}}/treatment

{
  "name": "Cilt Bakımı",
  "durationMinutes": 60,
  "price": 800,
  "color": "#10b981"
}
```

### 3.2 — Postman: Hizmetleri Listele
```
GET {{base}}/treatment
Authorization: Bearer {{token}}
```
✅ 3 hizmet listelensin

### 3.3 — Frontend: Hizmet Yönetimi
1. Sol menüden **Hizmetler** sayfasına git
2. Tabloda 3 hizmet göründüğünü doğrula
3. "Yeni" butonuyla 4. bir hizmet ekle
4. Bir hizmeti düzenle (fiyatı değiştir)
5. Bir hizmeti sil
6. ✅ Tüm CRUD işlemleri çalışıyor

---

## AŞAMA 4: Müşteri Ekleme

### 4.1 — Postman: Müşteri Oluştur
```
POST {{base}}/customer
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Ayşe",
  "surname": "Yılmaz",
  "phone": "+90 532 111 2233",
  "email": "ayse@email.com"
}
```
📝 `customerId = ?`

```
POST {{base}}/customer

{
  "name": "Fatma",
  "surname": "Demir",
  "phone": "+90 533 444 5566"
}
```

### 4.2 — Frontend: Müşteri Yönetimi
1. **Müşteriler** sayfasına git
2. Müşterileri gör
3. Arama kutusuna "Ayşe" yaz → filtre çalışıyor mu?
4. Yeni müşteri ekle, düzenle, sil
5. ✅ CRUD + arama çalışıyor

---

## AŞAMA 5: Personel Davet Etme

### 5.1 — Postman: Davet Kodu Oluştur
```
POST {{base}}/tenantonboarding/invite-token
Authorization: Bearer {{token}}
Content-Type: application/json

"staff1@glowatelier.com"
```
✅ Beklenen: Davet token kodu döner (örn: "ABC123")
📝 Token'ı not al

### 5.2 — Postman: Personel Kayıt
```
POST {{base}}/auth/register
Content-Type: application/json

{
  "inviteToken": "ABC123",
  "email": "staff1@glowatelier.com",
  "password": "Staff123!",
  "confirmPassword": "Staff123!",
  "name": "Ali",
  "surname": "Öztürk"
}
```
✅ Personel oluşturuldu

### 5.3 — Frontend: Personel Kayıt Sayfası
1. `http://localhost:3000/register` adresine git (çıkış yap önce)
2. Davet kodu + bilgileri gir
3. ✅ Kayıt başarılı

### 5.4 — Postman: Personel Listele
```
GET {{base}}/staff
Authorization: Bearer {{token}}
```
✅ Owner + yeni personel görünsün

---

## AŞAMA 6: Komisyon Oranı Belirleme

### 6.1 — Postman: Personele Genel Komisyon Ver
```
PUT {{base}}/commission/staff/{staffId}/rates
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "defaultCommissionRate": 30,
  "treatmentRates": [
    { "treatmentId": 1, "commissionRate": 40 },
    { "treatmentId": 2, "commissionRate": 25 }
  ]
}
```
✅ Ali'nin genel oranı %30, Saç Boyama'da %40, Manikür'de %25

### 6.2 — Postman: Komisyon Oranlarını Sorgula
```
GET {{base}}/commission/staff/{staffId}/rates
Authorization: Bearer {{token}}
```
✅ Oranlar doğru dönüyor

### 6.3 — Frontend: Komisyon Oranı Ayarlama
1. Sol menüden **Komisyonlar** (veya Diğer > Komisyonlar) sayfasına git
2. "Oran Ayarla" tabına tıkla
3. Personel seç → mevcut oranlar yüklensin
4. Oranları değiştir → Kaydet
5. ✅ Oran ayarlama çalışıyor

---

## AŞAMA 7: Randevu Oluşturma

### 7.1 — Postman: Randevu Oluştur
```
POST {{base}}/appointment
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "customerId": 1,
  "staffId": 2,
  "treatmentId": 1,
  "startTime": "2026-03-23T10:00:00",
  "notes": "Saç boyama randevusu"
}
```
📝 `appointmentId = ?`

### 7.2 — Tekrarlayan Randevu
```
POST {{base}}/appointment

{
  "customerId": 2,
  "staffId": 2,
  "treatmentId": 2,
  "startTime": "2026-03-24T14:00:00",
  "isRecurring": true,
  "recurrenceIntervalDays": 7,
  "totalSessions": 4
}
```
✅ 4 seans otomatik oluşsun

### 7.3 — Frontend: Randevu Yönetimi
1. **Randevular** sayfasına git → randevuları gör
2. "Yeni Randevu" ile randevu oluştur
3. **Takvim** sayfasına geç → randevular takvimde görünsün
4. Randevu durumunu değiştir (Onaylandı, Tamamlandı vb.)
5. ✅ Randevu CRUD + durum güncelleme çalışıyor

---

## AŞAMA 8: Ödeme Kaydetme (Komisyon Otomatik Oluşur)

### 8.1 — Postman: Ödeme Kaydet
```
POST {{base}}/appointmentpayment
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "appointmentId": 1,
  "amount": 500,
  "currencyId": 1,
  "exchangeRateToTry": 1,
  "paymentMethod": "Cash",
  "notes": "Nakit ödendi"
}
```
✅ Ödeme oluştu + komisyon kaydı otomatik oluştu

### 8.2 — Komisyon Kaydını Kontrol Et
```
GET {{base}}/commission/records
Authorization: Bearer {{token}}
```
✅ Beklenen:
- staffFullName: "Ali Öztürk"
- paymentAmountInTry: 500
- commissionRate: 40 (Saç Boyama'ya özel oran)
- commissionAmountInTry: 200 (500 × %40)
- salonShareInTry: 300
- isPaid: false

### 8.3 — Frontend: Ödeme Testi
1. **Ödemeler** sayfasına git
2. "Yeni Ödeme" ile ödeme kaydet
3. ✅ Ödeme listede görünsün

---

## AŞAMA 9: Komisyon Raporu ve Ödeme

### 9.1 — Postman: Komisyon Özeti
```
GET {{base}}/commission/summary
Authorization: Bearer {{token}}
```
✅ Personel bazlı toplam komisyon, ödenen/ödenmemiş

### 9.2 — Postman: Komisyonları Ödendi İşaretle
```
POST {{base}}/commission/mark-paid
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "commissionRecordIds": [1]
}
```
✅ isPaid = true, paidAt dolu

### 9.3 — Frontend: Komisyon Ekranı
1. **Komisyonlar** sayfasına git
2. **Özet** tabı: Personel bazlı komisyon tablosu
3. **Kayıtlar** tabı: Detaylı liste, checkbox ile seç → "Ödendi İşaretle"
4. ✅ Toplu ödeme işaretleme çalışıyor

---

## AŞAMA 10: Döviz Kuru (TCMB)

### 10.1 — Postman: Güncel Kurlar
```
GET {{base}}/exchangerate
Authorization: Bearer {{token}}
```
✅ TCMB'den USD, EUR, GBP kurları döner

### 10.2 — Postman: Tekil Kur
```
GET {{base}}/exchangerate/USD
Authorization: Bearer {{token}}
```
✅ USD/TRY kuru döner

### 10.3 — Postman: Kurları Yenile
```
POST {{base}}/exchangerate/refresh
Authorization: Bearer {{token}}
```
✅ Cache temizlenip güncel kurlar çekilir

### 10.4 — Para Birimleri
```
GET {{base}}/currency
Authorization: Bearer {{token}}
```
✅ TRY, USD, EUR, GBP + exchangeRateToTry alanları dolu

---

## AŞAMA 11: Masraflar (Expenses)

### 11.1 — Postman: Masraf Kategorisi Oluştur
```
POST {{base}}/expense/category
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Kira",
  "color": "#ef4444"
}
```

### 11.2 — Postman: Masraf Ekle
```
POST {{base}}/expense
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "expenseCategoryId": 1,
  "amount": 15000,
  "currencyId": 1,
  "exchangeRateToTry": 1,
  "description": "Mart 2026 kira ödemesi",
  "expenseDate": "2026-03-01"
}
```

### 11.3 — Frontend: Masraf Yönetimi
1. Sol menüden **Diğer > Masraflar** sayfasına git
2. Kategori ekle, masraf ekle
3. Masrafları filtrele (tarih, kategori)
4. ✅ CRUD çalışıyor

---

## AŞAMA 12: Finansal Raporlar

### 12.1 — Postman: Dashboard
```
GET {{base}}/financialreport/dashboard?startDate=2026-03-01&endDate=2026-03-31
Authorization: Bearer {{token}}
```
✅ Gelir, gider, net kar, hizmet bazlı dağılım

### 12.2 — Postman: Gelir Raporu
```
GET {{base}}/financialreport/revenue?startDate=2026-03-01&endDate=2026-03-31
Authorization: Bearer {{token}}
```
✅ Ödeme yöntemi, personel, hizmet bazlı kırılımlar

### 12.3 — Frontend: Kasa Raporu
1. **Raporlar > Kasa Raporu** sayfasına git
2. Tarih aralığı seç
3. ✅ Gelir/Gider/Net Kar kartları, personel bazlı tablo

---

## AŞAMA 13: Personel Programı (Staff Schedule)

### 13.1 — Postman: İzin/Kapalı Gün Ekle
```
POST {{base}}/staffschedule/unavailability?staffId=2
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "startTime": "2026-03-25T09:00:00",
  "endTime": "2026-03-25T18:00:00",
  "reason": "İzin",
  "notes": "Yıllık izin"
}
```

### 13.2 — Frontend: Personel Raporu
1. **Raporlar > Personel Raporu** sayfasına git
2. İzin kaydını gör
3. Yeni izin ekle
4. ✅ CRUD çalışıyor

---

## AŞAMA 14: Personel Girişi (Rol Testi)

### 14.1 — Personel ile Login
```
POST {{base}}/auth/login

{
  "emailOrUsername": "staff1@glowatelier.com",
  "password": "Staff123!"
}
```
📝 Staff token'ını kaydet

### 14.2 — Personel Kısıtlamalarını Test Et
```
# ✅ Çalışmalı — kendi randevularını görsün
GET {{base}}/appointment
Authorization: Bearer {{staffToken}}

# ✅ Çalışmalı — kendi komisyonunu görsün
GET {{base}}/commission/my
Authorization: Bearer {{staffToken}}

# ❌ 403 Forbidden — masrafları göremesin
GET {{base}}/expense
Authorization: Bearer {{staffToken}}

# ❌ 403 Forbidden — komisyon oranı ayarlayamasın
PUT {{base}}/commission/staff/2/rates
Authorization: Bearer {{staffToken}}
```

### 14.3 — Frontend: Personel Görünümü
1. Personel hesabıyla login ol
2. Dashboard'da sadece kendi verilerini gör
3. Masraflar sayfasına erişemediğini doğrula
4. ✅ Rol bazlı erişim kısıtlaması çalışıyor

---

## AŞAMA 15: Abonelik Sistemi

### 15.1 — Postman: Planları Listele
```
GET {{base}}/subscription/plans
```
✅ Başlangıç, Gold, Platinum planları

### 15.2 — Postman: Deneme Süresi Başlat
```
POST {{base}}/subscription/start-trial?planId=1
Authorization: Bearer {{token}}
```

### 15.3 — Frontend: Abonelik Sayfası
1. **Abonelik** sayfasına git
2. Planları gör, mevcut aboneliği kontrol et
3. ✅ Plan bilgileri doğru

---

## AŞAMA 16: Hata Sayfaları ve UX

### 16.1 — 404 Sayfası
1. `http://localhost:3000/olmayan-sayfa` adresine git
2. ✅ 404 sayfası görünsün

### 16.2 — Form Validation
1. Login sayfasında boş form gönder → ✅ Kırmızı border + hata mesajı
2. Signup sayfasında kısa şifre gir → ✅ "En az 8 karakter" uyarısı
3. Müşteri ekleme modalında zorunlu alanları boş bırak → ✅ Validation

### 16.3 — Token Süresi
1. Tarayıcı cookie'lerinden `estiva-token` sil
2. Dashboard'a gitmeyi dene → ✅ Login'e yönlendirme

---

## AŞAMA 17: Bildirim Sistemi

### 17.1 — Postman: Bildirim Ayarları
```
GET {{base}}/notification/settings
Authorization: Bearer {{token}}
```

### 17.2 — Postman: WhatsApp Entegrasyonu
```
PUT {{base}}/notification/whatsapp
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "apiUrl": "https://api.whatsapp.com",
  "apiToken": "test-token",
  "phoneNumberId": "123456"
}
```

---

## ✅ Test Kontrol Listesi

| # | Modül | Postman | Frontend | Durum |
|---|-------|---------|----------|-------|
| 1 | İşletme Kaydı | ☐ | ☐ | |
| 2 | Login/Logout | ☐ | ☐ | |
| 3 | Hizmet CRUD | ☐ | ☐ | |
| 4 | Müşteri CRUD | ☐ | ☐ | |
| 5 | Personel Davet/Kayıt | ☐ | ☐ | |
| 6 | Komisyon Oran Ayarlama | ☐ | ☐ | |
| 7 | Randevu CRUD | ☐ | ☐ | |
| 8 | Ödeme + Otomatik Komisyon | ☐ | ☐ | |
| 9 | Komisyon Rapor/Ödeme | ☐ | ☐ | |
| 10 | Döviz Kuru (TCMB) | ☐ | ☐ | |
| 11 | Masraf CRUD | ☐ | ☐ | |
| 12 | Finansal Raporlar | ☐ | ☐ | |
| 13 | Personel Programı | ☐ | ☐ | |
| 14 | Rol Bazlı Erişim | ☐ | ☐ | |
| 15 | Abonelik | ☐ | ☐ | |
| 16 | Hata Sayfaları/Validation | ☐ | ☐ | |
| 17 | Bildirimler | ☐ | ☐ | |
