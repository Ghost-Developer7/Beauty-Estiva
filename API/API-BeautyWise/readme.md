# BeautyWise API (SaaS)

**BeautyWise**; lazer epilasyon, güzellik ve klinik hizmet sunan işletmelerin randevu, personel, stok, finans ve müşteri ilişkilerini tek çatı altında takip eden, çok kiracılı (multi-tenant) ve bulut tabanlı bir ASP.NET Core API olarak tasarlandı. Amacı tek bir uygulama ile tüm işletmeleri izole ederek yönetmek, abonelik süreçlerini kontrol etmek, bildirimleri merkezileştirmek ve entegrasyon anahtarlarını her tenant için güvenle saklamaktır.

## Öne çıkan özellikler

- **Çok kiracılı veri izolasyonu:** Her tenant `Tenant`, `TenantUUID` ve `AppUser.TenantId` bağlamında ayrışır. Tenant’ın kullanıcı, plan, entegrasyon veya bildirim kuralı koleksiyonları yalnızca o tenant verisini taşır. `Tenant.ReminderHourBefore` gibi işletme seviyesindeki genel kurallar tenant bazında saklanır.
- **Hibrit veri yaklaşımı:** `Context` üzerinden EF Core (yazma, migration) kullanılırken, paket referanslarında yer alan `Dapper` sayesinde listeler ve raporlar yüksek performanslı sorgularla desteklenebilir.
- **Gelişmiş kimlik doğrulama:** `AppUser` ve `AppRole` Identity katmanında tanımlandı; `Program.cs` içinde JWT Bearer ile kimlik doğrulaması yapılır, özelleştirilmiş parola, kullanıcı ve lockout kuralları uygulanır. `AppSettings:Secret` JWT imzalamada kullanılır.
- **Bildirim yönetimi:** `TenantNotificationRule` işletmenin hangi kanalını açık/kapağını tutar, `UserNotificationPreference` personelin kendi tercihlerini saklar, `NotificationChannel` enum’u (Sms, Email, PushNotification, Whatsapp) kanal çeşitlerini listeler. Değişiklikler `TenantNotificationHistory` ile loglanır.
- **Abonelik & finans:** `SubscriptionPlan` üzerinde paket limitleri, SMS/AI yetenekleri ve fiyatlar saklanır. `TenantSubscription` aktif paketi, başlangıç-bitiş tarihleri ve satış anındaki fiyatı (snapshot) tutar. `TenantPaymentHistory` geçmiş ödemeleri, işlem kimliklerini ve durumları kaydeder.
- **Entegrasyon kayıtları:** Her tenant için SMS (`TenantSMSIntegration`), WhatsApp (`TenantWhatsappIntegration`), e-posta (`TenantEmailIntegration`) ve ödeme (`TenantPaymentIntegration`) sağlayıcıları ayrı satırlarda saklanır. İntegrasyon ayrıntıları (token, api anahtarı, başlık, SMTP bilgileri vb.) BaseEntity’den gelen audit alanlarıyla çalışır.
- **Marka & davet yönetimi:** `TenantLogo` dinamik logoları (`ImageUrl`, `IsSelected`) ve dosya ölçülerini saklarken, `TenantInviteToken` yeni personel davetlerinde kullanılan kodları ve geçerlilik tarihlerini yönetir.
- **Swagger belgeleri & statik içerik:** `Program.cs` içinde Swagger yapılandırması (Bearer auth) ve `UseStaticFiles` ile logo gibi medyaların sunulması öngörülmüştür.

## Veri modelleri & domain

### Tenant odaklı yapı
`Tenant` sınıfı şirket bilgilerini, `TenantUUID`, iletişim bilgisi, `ReminderHourBefore` gibi temel kuralları ve diğer koleksiyonları barındırır. Tenant’a bağlı olarak `TenantPaymentIntegration`, `TenantSMSIntegration`, `TenantWhatsappIntegration` modelleri aktif entegrasyon girişlerine karşılık gelir. Bir tenant sadece bir `TenantSubscription` kaydı `IsActive=true` olarak taşımalı, geçmiş abonelikler arşivlenmelidir.

### Kullanıcılar & roller
`AppUser` IdentityUser’tan genişletilmiş; isim, soyisim, doğum tarihi, tenant bağı, kişisel bildirim tercihleri (`UserNotificationPreference`) ve audit (CDate, UDate, IsActive, IsApproved) alanlarını içerir. `NotificationPreferences` sayesinde personel hangi kanaldan hangi bildirimleri almak istediğini seçer. `AppRole` ise `IdentityRole<int>`’i genişleterek rol kayıtlarını taşır.

### Abonelik & ödeme geçmişi
`SubscriptionPlan` paket adını, aylık/yıllık ücretleri, personel/şube limitlerini ve SMS/AI desteğini tanımlar. `TenantSubscription` satış sürecinde seçilen plan ve fiyat bilgisini (snapshot) saklar. `TenantPaymentHistory` kuyruğuna işlem kimliği, ödeme durumu (`PaymentStatus`), açıklama (örneğin “2025 Yıllık Gold Üyelik”) yazılır.

### Bildirim yönetimi
`TenantNotificationRule` ile tenant bazlı aktif kanallar belirlenir; pasif bir kanal personel tercihlerinde gösterilmez. `UserNotificationPreference` ile bireysel tercihler saklanır. `TenantNotificationHistory` değişiklikleri loglayarak `ChangedByUserId`, eski/yeni değer ve tarih bilgisini tutar. `NotificationChannel` enum’u sistemde dört kanal (Sms, Email, PushNotification, Whatsapp) üzerinden karar alınmasını sağlar.

### Marka & davet
`TenantLogo` farklı logo versiyonlarını, kaynak dosya adını, boyutunu ve o anki seçim (`IsSelected`) bilgisini saklar. `TenantInviteToken` 6 haneli davet kodunu, hedef e-posta ve süresiyle birlikte sunar, `IsUsed` bayrağı davetin tekrar kullanılmasını engeller.

### Entegrasyon detayları
`TenantPaymentIntegration` ödeme sağlayıcı ismini ve saklanan kart token’ını tutarken, `TenantSMSIntegration` (provider, header, kullanıcı/a anahtarı), `TenantWhatsappIntegration` (instance ID, API token) ve `TenantEmailIntegration` (SMTP sunucusu, port, kullanıcı, parola) her tenant için gerekli entegrasyon bilgilerini barındırır. Tüm bu modeller `BaseEntity`’den gelen audit alanları sayesinde kim/ne zaman kaydetti bilgilerini saklar.

### Yardımcı sınıflar
`BaseEntity` (CUser, UUser, CDate, UDate, IsActive) audit/veri kontrolü için standart alanlar sunar. `Context` sınıfı IdentityDbContext kalıtımı ile EF Core üzerinden varlıkları yönetir.

## Teknoloji yığını

| Kategori | Paketler & Açıklama |
| --- | --- |
| .NET / Framework | `.NET 8.0` Web SDK, `Microsoft.AspNetCore.Authentication.JwtBearer` (JWT), `System.IdentityModel.Tokens.Jwt` (token doğrulama) |
| Kimlik ve yetkilendirme | `Microsoft.AspNetCore.Identity.EntityFrameworkCore`, `Microsoft.AspNet.Identity.Core`, `Microsoft.AspNet.Identity.EntityFramework` (Identity altyapısı) |
| Veri erişimi | `Microsoft.EntityFrameworkCore` (+Design, +SqlServer) – yazma işlemi, migration; `Dapper 2.1.66` – yüksek performanslı okumalar/raporlama |
| Veritabanı istemcisi | `Microsoft.Data.SqlClient 6.1.3` (SQL Server bağlantısı) |
| Bildirim ve iletişim | `MailKit 4.14.1` (SMTP ile tenant e-posta gönderimi), `PuppeteerSharp 20.2.4` (otomasyon / PDF & ekran görüntüsü), `SixLabors.ImageSharp 3.1.12` (logo/media işleme) |
| Dokümantasyon | `Swashbuckle.AspNetCore 6.6.2` (Swagger/OpenAPI + Bearer güvenlik şeması) |
| Serileştirme | `Newtonsoft.Json 13.0.4` (legacy JSON ihtiyaçları) |

## Konfigürasyon ve ortam

1. `appsettings.json` içinde `ConnectionStrings:SqlServerConnection` değerini kendi SQL Server adresinize göre güncelleyin (örnek: `Server=YOUR_HOST;Database=BeautyWiseDB;Uid=sa;Pwd=PASSWORD;MultipleActiveResultSets=true;TrustServerCertificate=True;`).
2. `AppSettings:Secret` JWT imzalamada kullanılır; en az 64 karakterlik rastgele bir string girin.
3. `AllowedHosts` ve diğer `Logging` seviyeleri ihtiyaca göre ayarlanabilir.
4. Tenant’ların SMTP/SMS/WhatsApp/integration bilgilerini ilgili `Tenant*Integration` modelleri üzerinden saklayın; bu alanlar uygulama çalışırken dinamik olarak okunacaktır.

## Çalıştırma & geliştirme

1. `dotnet restore` ile paketleri indirip.
2. Gerekirse `dotnet ef migrations add Initial` ve `dotnet ef database update` komutları ile veri tabanınızı hazırlayın. EF Core araçları `Microsoft.EntityFrameworkCore.Design` tarafından sağlanır.
3. `dotnet run` ile API’yi başlatın.
4. `API-BeautyWise.http` dosyasını kullanarak `GET {{API_BeautyWise_HostAddress}}/weatherforecast/` gibi istek atabilir, Swagger UI aktifse (kod içinden `UseSwagger`/`UseSwaggerUI` yorum satırı kaldırılırsa) `https://localhost:{port}/swagger` üzerinden test edebilirsiniz.

## Swagger ve API belgeleme

`Program.cs` içinde Swagger dokümantasyonu `Swashbuckle` üzerinden tanımlanmıştır; Bearer güvenlik tanımı header’da `Authorization: Bearer {token}` kullanır. Geliştirme sırasında Swagger’ı açmak için yorum satırlarını kaldırarak:

```csharp
app.UseSwagger();
app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "BeautyWise API V1"); });
```

yapabilirsiniz. İstemcilerin token’ı header’a koyduğu sürece Controller bazlı yetkilendirme çalışacaktır.

## Geliştirici notları

- `Program.cs` sabit bir CORS politikası (`AllowAnyOrigin`, `AllowAnyHeader`, `AllowAnyMethod`) tanımlar; üretim ortamı için gerekli domain’leri kısıtlamayı unutmayın.
- JWT tokenları `AppSettings:Secret` ile HMAC-SHA256’ta imzalanır; `ValidateLifetime` true, issuer/audience valide edilmez (varsayılan).
- Identity password kısıtlamaları minimum 3 karakter ve sadece harf/sayı zorunluluğu içermez; lockout 5 başarısız girişte 5 dakika devreye girer.
- `UseStaticFiles()` sayesinde `TenantLogo.ImageUrl` gibi statik yollar doğrudan servis edilebilir. Geliştirme aşamasında `/uploads` benzeri klasörleri `wwwroot` altına bağlamak faydalı olur.
- Gelecekte `DeviceHub`/`NotificationHub` SignalR hub’ları eklenirse `JwtBearerEvents` içinden `access_token` query param’ını okuyarak socket erişimi sağlanabilir (kodda yorum satırı halinde örnek kalıntı mevcut).
- Her model `BaseEntity` alanları sayesinde audit tutulmak üzere genişletilebilir, null (Opsiyonel) audit aralığında dinamik olarak `CUser`, `UUser`, `CDate`, `UDate`, `IsActive` güncellenmelidir.

## Kaynaklar

- `Models/` klasörü içerisinde tüm tenant, kullanıcı, bildirim, entegrasyon, abonelik ve ödeme modelleri yer alır. Her biri `[ForeignKey]` ve `[Required]`/`[MaxLength]` ile veri bütünlüğü sağlar.
- `Enums/NotificationChannel.cs` dört adet kanal tanımı içerir ve bildirim modelleri tarafından referans edilir.
- `API-BeautyWise.http` basit bir `weatherforecast` testi sağlar; kendi controller’larınızı ekledikçe burayı genişletin.
- `appsettings.Development.json` (.gitignore dışında) yerel ortam değeri içeriyor; üretimde temiz bağlantılar kullanın.
