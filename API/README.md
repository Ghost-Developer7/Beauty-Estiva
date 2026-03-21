# 💅 BeautyWise API

**BeautyWise**, güzellik merkezleri için geliştirilmiş **çok kiracılı (Multi-Tenant) SaaS** tabanlı bir randevu ve işletme yönetim sistemidir. Güzellik salonları, lazer epilasyon merkezleri ve estetik klinikleri için abonelik bazlı hizmet sunar.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-12.0-239120?logo=csharp)](https://docs.microsoft.com/en-us/dotnet/csharp/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC2927?logo=microsoft-sql-server)](https://www.microsoft.com/sql-server)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Özellikler

### ✅ Mevcut Özellikler

- **🏢 Multi-Tenant Mimari**: Her işletme kendi verilerine izole erişim
- **🔐 JWT Authentication**: Güvenli kimlik doğrulama ve yetkilendirme
- **👥 Kullanıcı Yönetimi**: Owner ve Staff rolleri ile yetki kontrolü
- **🎫 Davet Sistemi**: Personel davet kodu ile kayıt
- **💳 Abonelik Altyapısı**: Esnek paket yönetimi (Başlangıç, Gold, Platinum)
- **🔔 Bildirim Altyapısı**: SMS, Email, WhatsApp, Push Notification desteği
- **🔌 Entegrasyon Hazır**: SMS, Email, WhatsApp, Ödeme entegrasyonları için altyapı

### 🚧 Geliştirme Aşamasında

- **📅 Randevu Yönetimi**: Müşteri, hizmet ve randevu sistemi
- **💰 Ödeme Entegrasyonu**: Iyzico/PayTR entegrasyonu
- **📊 Raporlama**: Dashboard ve analitik
- **📱 Mobil Uygulama**: Flutter ile mobil app

---

## 🏗️ Teknoloji Yığını

### Backend
- **.NET 8.0** - Modern web framework
- **ASP.NET Core Web API** - RESTful API
- **Entity Framework Core 8.0** - ORM
- **ASP.NET Core Identity** - Kullanıcı yönetimi
- **Dapper 2.1** - Performanslı sorgular

### Veritabanı
- **Microsoft SQL Server** - Ana veritabanı

### Kimlik Doğrulama
- **JWT Bearer Token** - Stateless authentication
- **System.IdentityModel.Tokens.Jwt** - Token yönetimi

### İletişim ve Bildirimler
- **MailKit** - SMTP email gönderimi
- **SMS Entegrasyonu** - Netgsm/İletimerkezi (Planlı)
- **WhatsApp API** - WhatsApp bildirimleri (Planlı)

### Diğer
- **Swagger/OpenAPI** - API dokümantasyonu
- **SixLabors.ImageSharp** - Görsel işleme
- **PuppeteerSharp** - PDF oluşturma
- **Newtonsoft.Json** - JSON işleme

---

## 📋 Gereksinimler

- **.NET 8.0 SDK** veya üzeri
- **SQL Server 2019** veya üzeri (veya SQL Server Express)
- **Visual Studio 2022** veya **VS Code** (önerilen)
- **Git** (versiyon kontrolü için)

---

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/Mehmet0732/API-BeautyWise.git
cd API-BeautyWise
```

### 2. Bağımlılıkları Yükleyin

```bash
cd API-BeautyWise
dotnet restore
```

### 3. Veritabanı Yapılandırması

`appsettings.json` dosyasını düzenleyin:

```json
{
  "ConnectionStrings": {
    "SqlServerConnection": "Server=YOUR_SERVER;Database=BeautyWise;Uid=YOUR_USER;Pwd=YOUR_PASSWORD;MultipleActiveResultSets=true;TrustServerCertificate=True;"
  },
  "AppSettings": {
    "Secret": "YOUR_JWT_SECRET_KEY_AT_LEAST_64_CHARACTERS_LONG"
  }
}
```

> ⚠️ **Güvenlik Uyarısı**: Production ortamında hassas bilgileri environment variable olarak saklayın!

### 4. Veritabanını Oluşturun

```bash
dotnet ef database update
```

### 5. Uygulamayı Çalıştırın

```bash
dotnet run
```

API şu adreste çalışacaktır: `https://localhost:5001` veya `http://localhost:5000`

### 6. Swagger UI'a Erişin

Tarayıcınızda açın: `https://localhost:5001/swagger`

---

## 📚 API Dokümantasyonu

### Authentication Endpoints

#### 🔐 Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "owner@salon.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Giriş başarılı.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "name": "Ayşe",
    "surname": "Yılmaz",
    "email": "owner@salon.com",
    "roles": ["Owner"]
  }
}
```

#### 👤 Personel Kaydı (Davet Kodu ile)
```http
POST /api/auth/register
Content-Type: application/json

{
  "inviteToken": "1234567890",
  "email": "staff@salon.com",
  "password": "123456",
  "confirmPassword": "123456",
  "name": "Ali",
  "surname": "Veli",
  "birthDate": "1990-01-01"
}
```

---

### Tenant Onboarding Endpoints

#### 🏢 İşletme Kaydı
```http
POST /api/tenantonboarding/register-tenant
Content-Type: application/json

{
  "companyName": "Güzellik Salonu A",
  "phone": "05551234567",
  "address": "İstanbul, Türkiye",
  "taxNumber": "1234567890",
  "taxOffice": "Kadıköy",
  "email": "owner@salon.com",
  "password": "123456",
  "confirmPassword": "123456",
  "name": "Ayşe",
  "surname": "Yılmaz"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": 1,
    "userId": 1
  }
}
```

#### 🎫 Davet Kodu Oluşturma (Owner)
```http
POST /api/tenantonboarding/invite-token
Authorization: Bearer {token}
Content-Type: application/json

"staff@salon.com"
```

**Response:**
```json
{
  "success": true,
  "data": "1234567890"
}
```

---

## 🗂️ Proje Yapısı

```
API-BeautyWise/
├── Controllers/           # API Controller'ları
│   ├── AuthController.cs
│   └── TenantOnboardingController.cs
├── Models/               # Veritabanı modelleri
│   ├── Tenant.cs
│   ├── AppUser.cs
│   ├── SubscriptionPlan.cs
│   ├── TenantSubscription.cs
│   └── ...
├── DTO/                  # Data Transfer Objects
│   ├── LoginRequestDto.cs
│   ├── LoginResultDto.cs
│   └── ...
├── Services/             # İş mantığı servisleri
│   ├── AuthService.cs
│   ├── TenantOnboardingService.cs
│   └── LogService.cs
├── Helpers/              # Yardımcı sınıflar
│   ├── JwtTokenGenerator.cs
│   └── TenantIdentifierGenerator.cs
├── Enums/                # Enum tanımları
│   ├── NotificationChannel.cs
│   └── LogLevel.cs
├── Migrations/           # EF Core migrations
├── Program.cs            # Uygulama giriş noktası
└── appsettings.json      # Yapılandırma dosyası
```

---

## 🔐 Güvenlik

### JWT Token Kullanımı

Tüm korumalı endpoint'lere erişim için JWT token gereklidir:

```http
GET /api/protected-endpoint
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roller ve Yetkiler

- **Owner**: İşletme sahibi - Tüm yetkilere sahip
- **Staff**: Personel - Sınırlı yetkiler

---

## 🧪 Test

### Unit Test Çalıştırma

```bash
dotnet test
```

### Swagger ile Manuel Test

1. Uygulamayı çalıştırın
2. `https://localhost:5001/swagger` adresine gidin
3. "Authorize" butonuna tıklayın
4. Login endpoint'i ile token alın
5. Token'ı "Bearer {token}" formatında girin
6. Diğer endpoint'leri test edin

---

## 📊 Veritabanı Şeması

### Temel Tablolar

- **Tenants**: İşletme bilgileri
- **Users**: Kullanıcılar (Owner ve Staff)
- **Roles**: Roller
- **SubscriptionPlans**: Abonelik planları
- **TenantSubscriptions**: İşletme abonelikleri
- **TenantPaymentHistories**: Ödeme geçmişi
- **TenantInviteTokens**: Davet kodları
- **TenantNotificationRules**: Bildirim kuralları
- **UserNotificationPreferences**: Kullanıcı bildirim tercihleri

### Entegrasyon Tabloları

- **TenantSMSIntegrations**: SMS entegrasyonları
- **TenantEmailIntegrations**: Email entegrasyonları
- **TenantWhatsappIntegrations**: WhatsApp entegrasyonları
- **TenantPaymentIntegrations**: Ödeme entegrasyonları

---

## 🛠️ Geliştirme

### Migration Oluşturma

```bash
dotnet ef migrations add MigrationName
```

### Migration Uygulama

```bash
dotnet ef database update
```

### Migration Geri Alma

```bash
dotnet ef database update PreviousMigrationName
```

---

## 📈 Yol Haritası

### Faz 1: Temel Randevu Sistemi (Devam Ediyor)
- [ ] Müşteri yönetimi (CRUD)
- [ ] Hizmet yönetimi (CRUD)
- [ ] Randevu yönetimi (CRUD)
- [ ] Randevu takvimi

### Faz 2: Abonelik ve Ödeme
- [ ] Abonelik planı yönetimi
- [ ] Abonelik satın alma
- [ ] Ödeme entegrasyonu (Iyzico/PayTR)
- [ ] Otomatik abonelik yenileme

### Faz 3: Bildirim Sistemi
- [ ] SMS servisi (Netgsm/İletimerkezi)
- [ ] Email servisi (SMTP)
- [ ] WhatsApp entegrasyonu
- [ ] Otomatik hatırlatmalar

### Faz 4: Raporlama
- [ ] Dashboard
- [ ] Randevu raporları
- [ ] Gelir raporları
- [ ] Excel export

### Faz 5: Gelişmiş Özellikler
- [ ] Stok yönetimi
- [ ] Kasa/Finans yönetimi
- [ ] Çoklu şube desteği
- [ ] Mobil uygulama (Flutter)
- [ ] Online randevu sistemi

---

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👨‍💻 Geliştirici

**Mehmet Kara**
- GitHub: [@Mehmet0732](https://github.com/Mehmet0732)

---

## 📞 İletişim

Sorularınız veya önerileriniz için:
- Email: [email protected]
- GitHub Issues: [Proje Issues](https://github.com/Mehmet0732/API-BeautyWise/issues)

---

## 🙏 Teşekkürler

Bu projeyi geliştirirken kullanılan açık kaynak kütüphanelere ve topluluğa teşekkürler.

---

## 📖 Ek Dokümantasyon

Detaylı proje analizi ve geliştirme planı için [PROJE_ANALIZI.md](PROJE_ANALIZI.md) dosyasına bakın.

---

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**
