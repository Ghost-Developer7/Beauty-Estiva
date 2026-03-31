-- ============================================================
-- Beauty-Estiva / BeautyWise - Test Verisi (Fake Data)
-- Doğru tablo isimleri: Users, Roles, UserRoles,
-- PackageSales_Packages, PackageSales_Usages, PackageSales_Payments
-- ============================================================
SET QUOTED_IDENTIFIER ON;
GO
USE BeautyWise;
GO

-- ============================================================
-- BÖLÜM 1: TENANT (Salon İşletmeleri)
-- ============================================================
SET IDENTITY_INSERT Tenants ON;

INSERT INTO Tenants (Id, TenantUUID, CompanyName, TaxNumber, TaxOffice, Address, Phone,
    ReminderHourBefore, Currency, Timezone, AppointmentSlotMinutes, AutoConfirmAppointments, BufferMinutes,
    CDate, IsActive)
VALUES
(100, 100001, N'Güzellik Dünyası', N'1234567890', N'Kadıköy VD',
    N'Bağdat Cad. No:125 Kadıköy/İstanbul', N'05321234567',
    24, N'TRY', N'Europe/Istanbul', 30, 0, 5,
    '2025-06-01', 1),
(101, 100002, N'Elite Beauty Studio', N'9876543210', N'Beşiktaş VD',
    N'Nispetiye Cad. No:42 Beşiktaş/İstanbul', N'05339876543',
    12, N'TRY', N'Europe/Istanbul', 30, 1, 0,
    '2025-09-15', 1);

SET IDENTITY_INSERT Tenants OFF;
GO

-- ============================================================
-- BÖLÜM 2: ŞUBELER (Branches)
-- ============================================================
SET IDENTITY_INSERT Branches ON;

INSERT INTO Branches (Id, TenantId, Name, Address, Phone, Email, IsMainBranch, CDate, IsActive)
VALUES
(100, 100, N'Kadıköy Merkez Şube', N'Bağdat Cad. No:125 Kadıköy/İstanbul', N'05321234567', N'kadikoy@guzellikdunyasi.com', 1, '2025-06-01', 1),
(101, 100, N'Ataşehir Şube', N'Atatürk Mah. Ersan Cad. No:8 Ataşehir/İstanbul', N'05321234568', N'atasehir@guzellikdunyasi.com', 0, '2025-08-01', 1),
(102, 101, N'Beşiktaş Merkez', N'Nispetiye Cad. No:42 Beşiktaş/İstanbul', N'05339876543', N'info@elitebeauty.com', 1, '2025-09-15', 1);

SET IDENTITY_INSERT Branches OFF;
GO

-- ============================================================
-- BÖLÜM 3: ROLLER (Roles) - Zaten 3 rol var, kontrol edip ekle
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Roles WHERE NormalizedName = N'ADMIN')
    INSERT INTO Roles (Name, NormalizedName, ConcurrencyStamp) VALUES (N'Admin', N'ADMIN', NEWID());

IF NOT EXISTS (SELECT 1 FROM Roles WHERE NormalizedName = N'STAFF')
    INSERT INTO Roles (Name, NormalizedName, ConcurrencyStamp) VALUES (N'Staff', N'STAFF', NEWID());

IF NOT EXISTS (SELECT 1 FROM Roles WHERE NormalizedName = N'SUPERADMIN')
    INSERT INTO Roles (Name, NormalizedName, ConcurrencyStamp) VALUES (N'SuperAdmin', N'SUPERADMIN', NEWID());
GO

-- ============================================================
-- BÖLÜM 4: KULLANICILAR (Users)
-- ============================================================
DECLARE @PwdHash NVARCHAR(MAX) = N'AQAAAAIAAYagAAAAEBbHMEm4RnkP3HlIf8NUGI/Zf8IBp1VqJF5k5CYcOLbNGATxYA/03ek9TRY3CDDQ2w==';

SET IDENTITY_INSERT Users ON;

INSERT INTO Users (Id, UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
    PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber, PhoneNumberConfirmed, TwoFactorEnabled,
    LockoutEnabled, AccessFailedCount, Name, Surname, BirthDate, DefaultCommissionRate,
    TenantId, BranchId, CDate, IsActive, IsApproved)
VALUES
-- Tenant 100: Güzellik Dünyası
(100, N'ayse.yilmaz@guzellikdunyasi.com', N'AYSE.YILMAZ@GUZELLIKDUNYASI.COM',
    N'ayse.yilmaz@guzellikdunyasi.com', N'AYSE.YILMAZ@GUZELLIKDUNYASI.COM', 1,
    @PwdHash, NEWID(), NEWID(), N'05321234567', 0, 0, 1, 0,
    N'Ayşe', N'Yılmaz', '1985-03-15', 0, 100, 100, '2025-06-01', 1, 1),

(101, N'fatma.demir@guzellikdunyasi.com', N'FATMA.DEMIR@GUZELLIKDUNYASI.COM',
    N'fatma.demir@guzellikdunyasi.com', N'FATMA.DEMIR@GUZELLIKDUNYASI.COM', 1,
    @PwdHash, NEWID(), NEWID(), N'05351112233', 0, 0, 1, 0,
    N'Fatma', N'Demir', '1990-07-22', 30, 100, 100, '2025-06-15', 1, 1),

(102, N'elif.kaya@guzellikdunyasi.com', N'ELIF.KAYA@GUZELLIKDUNYASI.COM',
    N'elif.kaya@guzellikdunyasi.com', N'ELIF.KAYA@GUZELLIKDUNYASI.COM', 1,
    @PwdHash, NEWID(), NEWID(), N'05362223344', 0, 0, 1, 0,
    N'Elif', N'Kaya', '1992-11-08', 25, 100, 100, '2025-07-01', 1, 1),

(103, N'zeynep.ozturk@guzellikdunyasi.com', N'ZEYNEP.OZTURK@GUZELLIKDUNYASI.COM',
    N'zeynep.ozturk@guzellikdunyasi.com', N'ZEYNEP.OZTURK@GUZELLIKDUNYASI.COM', 1,
    @PwdHash, NEWID(), NEWID(), N'05373334455', 0, 0, 1, 0,
    N'Zeynep', N'Öztürk', '1988-01-30', 35, 100, 101, '2025-08-01', 1, 1),

(104, N'merve.aksoy@guzellikdunyasi.com', N'MERVE.AKSOY@GUZELLIKDUNYASI.COM',
    N'merve.aksoy@guzellikdunyasi.com', N'MERVE.AKSOY@GUZELLIKDUNYASI.COM', 1,
    @PwdHash, NEWID(), NEWID(), N'05384445566', 0, 0, 1, 0,
    N'Merve', N'Aksoy', '1995-05-12', 20, 100, 101, '2025-09-01', 1, 1),

-- Tenant 101: Elite Beauty Studio
(105, N'selin.celik@elitebeauty.com', N'SELIN.CELIK@ELITEBEAUTY.COM',
    N'selin.celik@elitebeauty.com', N'SELIN.CELIK@ELITEBEAUTY.COM', 1,
    @PwdHash, NEWID(), NEWID(), N'05339876543', 0, 0, 1, 0,
    N'Selin', N'Çelik', '1987-09-03', 0, 101, 102, '2025-09-15', 1, 1),

(106, N'deniz.arslan@elitebeauty.com', N'DENIZ.ARSLAN@ELITEBEAUTY.COM',
    N'deniz.arslan@elitebeauty.com', N'DENIZ.ARSLAN@ELITEBEAUTY.COM', 1,
    @PwdHash, NEWID(), NEWID(), N'05391112233', 0, 0, 1, 0,
    N'Deniz', N'Arslan', '1993-04-18', 30, 101, 102, '2025-10-01', 1, 1),

(107, N'burak.sahin@elitebeauty.com', N'BURAK.SAHIN@ELITEBEAUTY.COM',
    N'burak.sahin@elitebeauty.com', N'BURAK.SAHIN@ELITEBEAUTY.COM', 1,
    @PwdHash, NEWID(), NEWID(), N'05402223344', 0, 0, 1, 0,
    N'Burak', N'Şahin', '1991-12-25', 25, 101, 102, '2025-10-15', 1, 1),

(108, N'gizem.yildiz@elitebeauty.com', N'GIZEM.YILDIZ@ELITEBEAUTY.COM',
    N'gizem.yildiz@elitebeauty.com', N'GIZEM.YILDIZ@ELITEBEAUTY.COM', 1,
    @PwdHash, NEWID(), NEWID(), N'05413334455', 0, 0, 1, 0,
    N'Gizem', N'Yıldız', '1996-08-07', 20, 101, 102, '2025-11-01', 1, 1),

(109, N'cem.karaca@elitebeauty.com', N'CEM.KARACA@ELITEBEAUTY.COM',
    N'cem.karaca@elitebeauty.com', N'CEM.KARACA@ELITEBEAUTY.COM', 1,
    @PwdHash, NEWID(), NEWID(), N'05424445566', 0, 0, 1, 0,
    N'Cem', N'Karaca', '1989-02-14', 30, 101, 102, '2025-11-15', 1, 1);

SET IDENTITY_INSERT Users OFF;
GO

-- ============================================================
-- BÖLÜM 5: KULLANICI ROLLERİ (UserRoles)
-- ============================================================
DECLARE @AdminRoleId INT = (SELECT Id FROM Roles WHERE NormalizedName = N'ADMIN');
DECLARE @StaffRoleId INT = (SELECT Id FROM Roles WHERE NormalizedName = N'STAFF');

INSERT INTO UserRoles (UserId, RoleId) VALUES
(100, @AdminRoleId), -- Ayşe = Admin
(101, @StaffRoleId), -- Fatma = Staff
(102, @StaffRoleId), -- Elif = Staff
(103, @StaffRoleId), -- Zeynep = Staff
(104, @StaffRoleId), -- Merve = Staff
(105, @AdminRoleId), -- Selin = Admin
(106, @StaffRoleId), -- Deniz = Staff
(107, @StaffRoleId), -- Burak = Staff
(108, @StaffRoleId), -- Gizem = Staff
(109, @StaffRoleId); -- Cem = Staff
GO

-- ============================================================
-- BÖLÜM 6: ABONELİK (TenantSubscriptions)
-- ============================================================
SET IDENTITY_INSERT TenantSubscriptions ON;

INSERT INTO TenantSubscriptions (Id, TenantId, SubscriptionPlanId, PriceSold, StartDate, EndDate,
    IsTrialPeriod, AutoRenew, PaymentStatus, IsCancelled, IsRefunded, FailedPaymentAttempts,
    IsInGracePeriod, CDate, IsActive)
VALUES
(100, 100, 2, 1000, '2025-06-01', '2026-06-01', 0, 1, N'Paid', 0, 0, 0, 0, '2025-06-01', 1),
(101, 101, 3, 2000, '2025-09-15', '2026-09-15', 0, 1, N'Paid', 0, 0, 0, 0, '2025-09-15', 1);

SET IDENTITY_INSERT TenantSubscriptions OFF;
GO

-- ============================================================
-- BÖLÜM 7: MÜŞTERİLER (Customers)
-- ============================================================
SET IDENTITY_INSERT Customers ON;

INSERT INTO Customers (Id, TenantId, Name, Surname, Phone, Email, BirthDate, Notes,
    LoyaltyPoints, TotalSpent, TotalVisits, LastVisitDate, CustomerSince,
    PreferredStaffId, Allergies, Tags, ReferralSource, CDate, IsActive)
VALUES
-- Tenant 100 müşterileri
(100, 100, N'Şeyma', N'Aydın', N'05501112233', N'seyma.aydin@gmail.com', '1990-04-15',
    N'Düzenli müşteri, her ay gelir', 250, 4500.00, 12, '2026-03-15', '2025-07-01',
    101, NULL, N'["VIP","Düzenli"]', N'Instagram', '2025-07-01', 1),
(101, 100, N'Melis', N'Yalçın', N'05502223344', N'melis.y@hotmail.com', '1988-11-20',
    N'Saç boyası alerjisi var - dikkat!', 180, 3200.00, 8, '2026-03-10', '2025-08-15',
    102, N'Amonyak bazlı boyalar', N'["Düzenli"]', N'Arkadaş tavsiyesi', '2025-08-15', 1),
(102, 100, N'Canan', N'Polat', N'05503334455', NULL, '1975-06-28',
    N'Sadece hafta sonları gelebiliyor', 80, 1800.00, 5, '2026-02-22', '2025-10-01',
    NULL, NULL, N'["Hafta sonu"]', N'Google', '2025-10-01', 1),
(103, 100, N'İrem', N'Başaran', N'05504445566', N'irem.basaran@yahoo.com', '1997-01-05',
    NULL, 320, 5600.00, 15, '2026-03-28', '2025-06-20',
    101, NULL, N'["VIP","Düzenli","Öğrenci"]', N'TikTok', '2025-06-20', 1),
(104, 100, N'Hande', N'Erçel', N'05505556677', NULL, '1993-08-14',
    N'Cilt bakımına özel ilgi', 150, 2900.00, 7, '2026-03-01', '2025-09-10',
    103, NULL, N'["Cilt bakım"]', N'Instagram', '2025-09-10', 1),
(105, 100, N'Derya', N'Koç', N'05506667788', N'derya.koc@gmail.com', '1982-12-03',
    N'Paket satış müşterisi', 400, 8500.00, 20, '2026-03-25', '2025-07-05',
    102, NULL, N'["VIP","Paket"]', N'Tabela', '2025-07-05', 1),
(106, 100, N'Ece', N'Türkmen', N'05507778899', NULL, '2000-03-22',
    NULL, 50, 750.00, 3, '2026-01-15', '2025-12-01',
    NULL, NULL, N'["Yeni"]', N'Google', '2025-12-01', 1),
(107, 100, N'Sibel', N'Güneş', N'05508889900', N'sibel.g@outlook.com', '1978-09-11',
    N'Her 6 haftada bir saç boyası', 200, 3800.00, 10, '2026-03-20', '2025-08-01',
    101, NULL, N'["Düzenli","Boya"]', N'Arkadaş tavsiyesi', '2025-08-01', 1),
(108, 100, N'Burcu', N'Sönmez', N'05509990011', NULL, '1986-05-30',
    N'Gelinlik saçı için geldi', 30, 2500.00, 1, '2026-03-05', '2026-02-20',
    103, NULL, N'["Gelin"]', N'Instagram', '2026-02-20', 1),
(109, 100, N'Pınar', N'Aktaş', N'05501230011', N'pinar.a@gmail.com', '1994-07-19',
    NULL, 120, 2100.00, 6, '2026-03-18', '2025-10-15',
    104, NULL, N'["Düzenli"]', NULL, '2025-10-15', 1),

-- Tenant 101 müşterileri
(110, 101, N'Beren', N'Saat', N'05551112233', N'beren.s@gmail.com', '1984-02-26',
    N'Premium müşteri - özel ilgi', 500, 12000.00, 25, '2026-03-27', '2025-10-01',
    106, NULL, N'["VIP","Premium"]', N'Referans', '2025-10-01', 1),
(111, 101, N'Neslihan', N'Atagül', N'05552223344', NULL, '1992-08-20',
    NULL, 180, 3500.00, 9, '2026-03-22', '2025-11-01',
    107, NULL, N'["Düzenli"]', N'Instagram', '2025-11-01', 1),
(112, 101, N'Hazal', N'Kaya', N'05553334455', N'hazal.k@outlook.com', '1990-10-01',
    N'Keratin bakım düzenli', 250, 5200.00, 13, '2026-03-25', '2025-10-15',
    106, N'Lateks alerjisi', N'["VIP","Düzenli"]', N'Google', '2025-10-15', 1),
(113, 101, N'Bergüzar', N'Korel', N'05554445566', NULL, '1982-08-27',
    NULL, 100, 1900.00, 5, '2026-02-28', '2025-12-01',
    108, NULL, N'[]', N'Arkadaş tavsiyesi', '2025-12-01', 1),
(114, 101, N'Cansu', N'Dere', N'05555556677', N'cansu.d@gmail.com', '1986-10-14',
    N'Tırnak bakımı ve nail art seviyor', 220, 4100.00, 11, '2026-03-20', '2025-10-20',
    108, NULL, N'["Tırnak","Düzenli"]', N'TikTok', '2025-10-20', 1),
(115, 101, N'Tuba', N'Büyüküstün', N'05556667788', NULL, '1981-07-05',
    NULL, 90, 1600.00, 4, '2026-01-10', '2025-11-15',
    NULL, NULL, N'[]', N'Google', '2025-11-15', 1),
(116, 101, N'Fahriye', N'Evcen', N'05557778899', N'fahriye.e@gmail.com', '1986-06-04',
    N'Saç bakım uzmanı tercihi var', 300, 6800.00, 17, '2026-03-28', '2025-10-05',
    107, NULL, N'["VIP","Düzenli","Saç bakım"]', N'Instagram', '2025-10-05', 1),
(117, 101, N'Aslı', N'Enver', N'05558889900', NULL, '1984-04-10',
    NULL, 60, 900.00, 2, '2026-02-15', '2026-01-10',
    NULL, NULL, N'["Yeni"]', NULL, '2026-01-10', 1),
(118, 101, N'Songül', N'Öden', N'05559990011', N'songul.o@hotmail.com', '1979-12-18',
    N'Anti-aging cilt bakım paketi', 350, 7500.00, 18, '2026-03-26', '2025-10-10',
    109, NULL, N'["VIP","Paket","Cilt bakım"]', N'Referans', '2025-10-10', 1),
(119, 101, N'Demet', N'Özdemir', N'05551230011', NULL, '1995-03-08',
    NULL, 70, 1200.00, 3, '2026-03-12', '2026-01-20',
    NULL, NULL, N'[]', N'Google', '2026-01-20', 1);

SET IDENTITY_INSERT Customers OFF;
GO

-- ============================================================
-- BÖLÜM 8: HİZMETLER (Treatments)
-- ============================================================
SET IDENTITY_INSERT Treatments ON;

INSERT INTO Treatments (Id, TenantId, Name, Description, DurationMinutes, Price, Color, CDate, IsActive)
VALUES
-- Tenant 100
(100, 100, N'Saç Kesimi (Kadın)', N'Yıkama, kesim ve fön dahil', 60, 350.00, N'#FF6B6B', '2025-06-01', 1),
(101, 100, N'Saç Boyama', N'Tek renk saç boyama işlemi', 90, 800.00, N'#4ECDC4', '2025-06-01', 1),
(102, 100, N'Röfle / Balyaj', N'Modern röfle ve balyaj teknikleri', 120, 1500.00, N'#45B7D1', '2025-06-01', 1),
(103, 100, N'Fön', N'Yıkama ve fön', 30, 150.00, N'#96CEB4', '2025-06-01', 1),
(104, 100, N'Keratin Bakım', N'Brezilya keratin saç bakımı', 150, 2500.00, N'#FFEAA7', '2025-06-01', 1),
(105, 100, N'Manikür', N'Klasik manikür uygulaması', 45, 200.00, N'#DDA0DD', '2025-06-01', 1),
(106, 100, N'Pedikür', N'Klasik pedikür uygulaması', 60, 250.00, N'#98D8C8', '2025-06-01', 1),
(107, 100, N'Cilt Bakımı', N'Derin cilt temizliği ve bakım', 75, 500.00, N'#F7DC6F', '2025-06-01', 1),
(108, 100, N'Kaş Dizaynı', N'Kaş şekillendirme ve alma', 20, 100.00, N'#BB8FCE', '2025-06-01', 1),
(109, 100, N'Ağda (Tüm Vücut)', N'Tam vücut ağda uygulaması', 90, 600.00, N'#F1948A', '2025-06-01', 1),
-- Tenant 101
(110, 101, N'Saç Kesimi (Kadın)', N'Premium saç kesimi, yıkama ve styling', 60, 500.00, N'#E74C3C', '2025-09-15', 1),
(111, 101, N'Saç Boyama', N'Profesyonel saç boyama', 90, 1200.00, N'#3498DB', '2025-09-15', 1),
(112, 101, N'Ombre / Sombre', N'Ombre ve sombre renklendirme', 150, 2500.00, N'#2ECC71', '2025-09-15', 1),
(113, 101, N'Saç Kesimi (Erkek)', N'Erkek saç kesimi ve şekillendirme', 30, 250.00, N'#1ABC9C', '2025-09-15', 1),
(114, 101, N'Sakal Tıraşı', N'Klasik ustura tıraşı', 30, 150.00, N'#F39C12', '2025-09-15', 1),
(115, 101, N'Keratin Bakım', N'Premium keratin düzleştirme', 180, 3500.00, N'#9B59B6', '2025-09-15', 1),
(116, 101, N'Nail Art', N'Özel tırnak tasarımı', 60, 400.00, N'#E91E63', '2025-09-15', 1),
(117, 101, N'Cilt Bakımı (Premium)', N'HydraFacial ve anti-aging bakım', 90, 1000.00, N'#00BCD4', '2025-09-15', 1),
(118, 101, N'Lazer Epilasyon', N'Diode lazer epilasyon seansı', 45, 800.00, N'#FF5722', '2025-09-15', 1),
(119, 101, N'Micropigmentation', N'Kalıcı kaş kontürü', 120, 3000.00, N'#795548', '2025-09-15', 1);

SET IDENTITY_INSERT Treatments OFF;
GO

-- ============================================================
-- BÖLÜM 9: RANDEVULAR (Appointments)
-- ============================================================
SET IDENTITY_INSERT Appointments ON;

INSERT INTO Appointments (Id, TenantId, CustomerId, StaffId, TreatmentId, StartTime, EndTime,
    Status, Notes, IsRecurring, SessionNumber, CDate, IsActive)
VALUES
-- Tenant 100 - Geçmiş (tamamlanmış)
(100, 100, 100, 101, 100, '2026-03-15 10:00', '2026-03-15 11:00', 3, N'Katmanlı kesim istedi', 0, 1, '2026-03-10', 1),
(101, 100, 101, 102, 101, '2026-03-10 14:00', '2026-03-10 15:30', 3, N'Amonyaksız boya kullanıldı', 0, 1, '2026-03-05', 1),
(102, 100, 103, 101, 102, '2026-03-08 11:00', '2026-03-08 13:00', 3, N'Balyaj - karamel tonları', 0, 1, '2026-03-01', 1),
(103, 100, 105, 102, 104, '2026-03-25 09:00', '2026-03-25 11:30', 3, NULL, 0, 1, '2026-03-20', 1),
(104, 100, 107, 101, 101, '2026-03-20 15:00', '2026-03-20 16:30', 3, N'Kızıl bakır tonları', 0, 1, '2026-03-18', 1),
-- Tenant 100 - Bugün/yakın gelecek
(105, 100, 100, 101, 103, '2026-03-31 09:00', '2026-03-31 09:30', 2, N'Düğün hazırlığı', 0, 1, '2026-03-28', 1),
(106, 100, 104, 103, 107, '2026-03-31 10:00', '2026-03-31 11:15', 1, NULL, 0, 1, '2026-03-29', 1),
(107, 100, 109, 104, 105, '2026-03-31 14:00', '2026-03-31 14:45', 1, N'French manikür', 0, 1, '2026-03-30', 1),
-- Tenant 100 - Gelecek
(108, 100, 106, 102, 100, '2026-04-02 11:00', '2026-04-02 12:00', 1, NULL, 0, 1, '2026-03-28', 1),
(109, 100, 108, 103, 109, '2026-04-05 13:00', '2026-04-05 14:30', 1, N'Gelin hazırlığı öncesi', 0, 1, '2026-03-30', 1),
-- Tenant 100 - İptal
(110, 100, 102, 101, 103, '2026-03-22 16:00', '2026-03-22 16:30', 4, N'Müşteri hastalandı', 0, 1, '2026-03-20', 1),
-- Tenant 101 - Geçmiş
(111, 101, 110, 106, 110, '2026-03-27 10:00', '2026-03-27 11:00', 3, N'Premium kesim + bakım', 0, 1, '2026-03-25', 1),
(112, 101, 112, 107, 115, '2026-03-25 09:00', '2026-03-25 12:00', 3, NULL, 0, 1, '2026-03-22', 1),
(113, 101, 116, 107, 111, '2026-03-28 14:00', '2026-03-28 15:30', 3, N'Koyu kahve tonları', 0, 1, '2026-03-26', 1),
(114, 101, 114, 108, 116, '2026-03-20 11:00', '2026-03-20 12:00', 3, N'Gel nail art - çiçek deseni', 0, 1, '2026-03-18', 1),
-- Tenant 101 - Bugün/yakın gelecek
(115, 101, 110, 106, 117, '2026-03-31 10:00', '2026-03-31 11:30', 2, N'Aylık anti-aging bakım', 0, 1, '2026-03-29', 1),
(116, 101, 118, 109, 117, '2026-03-31 14:00', '2026-03-31 15:30', 1, NULL, 0, 1, '2026-03-30', 1),
(117, 101, 111, 107, 112, '2026-04-01 09:00', '2026-04-01 11:30', 1, N'Sombre geçiş istiyor', 0, 1, '2026-03-29', 1),
(118, 101, 119, 108, 118, '2026-04-03 15:00', '2026-04-03 15:45', 1, N'İlk seans', 0, 1, '2026-03-31', 1),
-- Tenant 101 - NoShow
(119, 101, 115, 106, 110, '2026-03-18 11:00', '2026-03-18 12:00', 5, N'Müşteri gelmedi, aranacak', 0, 1, '2026-03-15', 1);

SET IDENTITY_INSERT Appointments OFF;
GO

-- ============================================================
-- BÖLÜM 10: RANDEVU ÖDEMELERİ (AppointmentPayments)
-- ============================================================
SET IDENTITY_INSERT AppointmentPayments ON;

INSERT INTO AppointmentPayments (Id, TenantId, AppointmentId, Amount, CurrencyId, ExchangeRateToTry, AmountInTry,
    PaymentMethod, PaidAt, Notes, CDate, IsActive)
VALUES
(100, 100, 100, 350.00, 1, 1, 350.00, 1, '2026-03-15 11:00', NULL, '2026-03-15', 1),
(101, 100, 101, 800.00, 1, 1, 800.00, 2, '2026-03-10 15:30', N'Kredi kartı ile', '2026-03-10', 1),
(102, 100, 102, 1500.00, 1, 1, 1500.00, 2, '2026-03-08 13:00', NULL, '2026-03-08', 1),
(103, 100, 103, 2500.00, 1, 1, 2500.00, 1, '2026-03-25 11:30', N'Nakit ödendi', '2026-03-25', 1),
(104, 100, 104, 800.00, 1, 1, 800.00, 2, '2026-03-20 16:30', NULL, '2026-03-20', 1),
(105, 101, 111, 500.00, 1, 1, 500.00, 2, '2026-03-27 11:00', NULL, '2026-03-27', 1),
(106, 101, 112, 3500.00, 1, 1, 3500.00, 2, '2026-03-25 12:00', N'Visa ile ödendi', '2026-03-25', 1),
(107, 101, 113, 1200.00, 1, 1, 1200.00, 1, '2026-03-28 15:30', N'Nakit', '2026-03-28', 1),
(108, 101, 114, 400.00, 1, 1, 400.00, 2, '2026-03-20 12:00', NULL, '2026-03-20', 1),
(109, 101, 111, 15.00, 2, 33.50, 502.50, 1, '2026-03-27 11:05', N'USD nakit ek ödeme', '2026-03-27', 1);

SET IDENTITY_INSERT AppointmentPayments OFF;
GO

-- ============================================================
-- BÖLÜM 11: ÜRÜNLER (Products)
-- ============================================================
SET IDENTITY_INSERT Products ON;

INSERT INTO Products (Id, TenantId, Name, Description, Barcode, Price, StockQuantity, CDate, IsActive)
VALUES
(100, 100, N'L''Oréal Elvive Şampuan 400ml', N'Hasar görmüş saçlar için onarıcı şampuan', N'8690572123456', 189.90, 25, '2025-06-01', 1),
(101, 100, N'Schwarzkopf BC Bonacure Saç Maskesi', N'Yoğun nemlendirici maske 200ml', N'4045787234567', 320.00, 15, '2025-06-01', 1),
(102, 100, N'Wella Professionals Saç Spreyi', N'Güçlü tutuş saç spreyi 300ml', N'8005610345678', 210.00, 30, '2025-06-01', 1),
(103, 100, N'OPI Nail Lacquer', N'Oje - Big Apple Red', N'0619828456789', 280.00, 40, '2025-06-01', 1),
(104, 100, N'Moroccanoil Saç Bakım Yağı 100ml', N'Argan yağı bazlı saç bakım', N'7290014567890', 550.00, 12, '2025-06-01', 1),
(105, 101, N'Kérastase Nutritive Şampuan 250ml', N'Kuru saçlar için besleyici şampuan', N'3474636678901', 680.00, 20, '2025-09-15', 1),
(106, 101, N'Olaplex No.3 Hair Perfector', N'Ev bakımı için bağ onarıcı', N'8966789012345', 750.00, 18, '2025-09-15', 1),
(107, 101, N'GHD Isı Koruyucu Sprey', N'Saçı ısıdan koruyan sprey 120ml', N'5060034890123', 420.00, 22, '2025-09-15', 1),
(108, 101, N'Essie Gel Couture Oje', N'Uzun ömürlü gel oje - Ballet Nudes', N'0095008901234', 350.00, 35, '2025-09-15', 1),
(109, 101, N'La Roche-Posay Effaclar Duo+', N'Akne bakım kremi 40ml', N'3337875598012', 590.00, 10, '2025-09-15', 1);

SET IDENTITY_INSERT Products OFF;
GO

-- ============================================================
-- BÖLÜM 12: ÜRÜN SATIŞLARI (ProductSales)
-- ============================================================
SET IDENTITY_INSERT ProductSales ON;

INSERT INTO ProductSales (Id, TenantId, ProductId, CustomerId, StaffId, Quantity, UnitPrice, TotalAmount,
    CurrencyId, ExchangeRateToTry, AmountInTry, PaymentMethod, SaleDate, Notes, CDate, IsActive)
VALUES
(100, 100, 100, 100, 101, 1, 189.90, 189.90, 1, 1, 189.90, 1, '2026-03-15 11:10', N'Randevu sonrası satış', '2026-03-15', 1),
(101, 100, 104, 103, 101, 1, 550.00, 550.00, 1, 1, 550.00, 2, '2026-03-08 13:15', NULL, '2026-03-08', 1),
(102, 100, 101, 105, 102, 2, 320.00, 640.00, 1, 1, 640.00, 2, '2026-03-25 11:45', N'2 adet aldı', '2026-03-25', 1),
(103, 100, 103, 109, 104, 3, 280.00, 840.00, 1, 1, 840.00, 1, '2026-03-18 15:00', N'3 farklı renk', '2026-03-18', 1),
(104, 100, 102, NULL, 101, 1, 210.00, 210.00, 1, 1, 210.00, 1, '2026-03-20 17:00', N'Kayıtsız müşteri', '2026-03-20', 1),
(105, 101, 105, 110, 106, 1, 680.00, 680.00, 1, 1, 680.00, 2, '2026-03-27 11:15', NULL, '2026-03-27', 1),
(106, 101, 106, 112, 107, 1, 750.00, 750.00, 1, 1, 750.00, 2, '2026-03-25 12:10', N'Keratin sonrası ev bakımı', '2026-03-25', 1),
(107, 101, 108, 114, 108, 2, 350.00, 700.00, 1, 1, 700.00, 1, '2026-03-20 12:15', NULL, '2026-03-20', 1),
(108, 101, 109, 118, 109, 1, 590.00, 590.00, 1, 1, 590.00, 2, '2026-03-26 15:30', N'Cilt bakım sonrası tavsiye', '2026-03-26', 1),
(109, 101, 107, 116, 107, 1, 420.00, 420.00, 1, 1, 420.00, 1, '2026-03-28 15:45', NULL, '2026-03-28', 1);

SET IDENTITY_INSERT ProductSales OFF;
GO

-- ============================================================
-- BÖLÜM 13: GİDER KATEGORİLERİ (ExpenseCategories)
-- ============================================================
SET IDENTITY_INSERT ExpenseCategories ON;

INSERT INTO ExpenseCategories (Id, TenantId, Name, Color, CDate, IsActive)
VALUES
(100, 100, N'Kira', N'#E74C3C', '2025-06-01', 1),
(101, 100, N'Malzeme/Ürün Alımı', N'#3498DB', '2025-06-01', 1),
(102, 100, N'Personel Maaşı', N'#2ECC71', '2025-06-01', 1),
(103, 100, N'Fatura (Elektrik/Su/Doğalgaz)', N'#F39C12', '2025-06-01', 1),
(104, 100, N'Reklam/Pazarlama', N'#9B59B6', '2025-06-01', 1),
(105, 101, N'Kira', N'#E74C3C', '2025-09-15', 1),
(106, 101, N'Ürün Stok', N'#3498DB', '2025-09-15', 1),
(107, 101, N'Personel Gideri', N'#2ECC71', '2025-09-15', 1),
(108, 101, N'Faturalar', N'#F39C12', '2025-09-15', 1),
(109, 101, N'Bakım/Onarım', N'#95A5A6', '2025-09-15', 1);

SET IDENTITY_INSERT ExpenseCategories OFF;
GO

-- ============================================================
-- BÖLÜM 14: GİDERLER (Expenses)
-- ============================================================
SET IDENTITY_INSERT Expenses ON;

INSERT INTO Expenses (Id, TenantId, ExpenseCategoryId, Amount, CurrencyId, ExchangeRateToTry, AmountInTry,
    Description, ExpenseDate, ReceiptNumber, Notes, CDate, IsActive)
VALUES
(100, 100, 100, 15000.00, 1, 1, 15000.00, N'Mart 2026 Kadıköy kira', '2026-03-01', N'KR-2026-03', NULL, '2026-03-01', 1),
(101, 100, 101, 8500.00, 1, 1, 8500.00, N'Ürün siparişi', '2026-03-05', N'FAT-2026-0312', N'30 adet şampuan + 15 maske', '2026-03-05', 1),
(102, 100, 103, 2800.00, 1, 1, 2800.00, N'Mart elektrik faturası', '2026-03-15', N'ELK-2026-03', NULL, '2026-03-15', 1),
(103, 100, 103, 850.00, 1, 1, 850.00, N'Mart su faturası', '2026-03-15', N'SU-2026-03', NULL, '2026-03-15', 1),
(104, 100, 104, 3000.00, 1, 1, 3000.00, N'Instagram reklam - Mart', '2026-03-01', NULL, N'Story + feed reklam', '2026-03-01', 1),
(105, 100, 100, 8000.00, 1, 1, 8000.00, N'Mart 2026 Ataşehir kira', '2026-03-01', N'KR-ATS-2026-03', NULL, '2026-03-01', 1),
(106, 101, 105, 25000.00, 1, 1, 25000.00, N'Mart 2026 Beşiktaş kira', '2026-03-01', N'KR-BSK-2026-03', NULL, '2026-03-01', 1),
(107, 101, 106, 15000.00, 1, 1, 15000.00, N'Toptan ürün siparişi', '2026-03-10', N'FAT-KRS-0310', NULL, '2026-03-10', 1),
(108, 101, 106, 450.00, 2, 33.50, 15075.00, N'Olaplex import order', '2026-03-12', N'INV-OPX-0312', N'USD ile ödendi', '2026-03-12', 1),
(109, 101, 108, 4200.00, 1, 1, 4200.00, N'Mart elektrik + su + doğalgaz', '2026-03-18', N'FAT-2026-0318', NULL, '2026-03-18', 1);

SET IDENTITY_INSERT Expenses OFF;
GO

-- ============================================================
-- BÖLÜM 15: PAKET SATIŞLARI (PackageSales_Packages)
-- ============================================================
SET IDENTITY_INSERT PackageSales_Packages ON;

INSERT INTO PackageSales_Packages (Id, TenantId, CustomerId, TreatmentId, StaffId, TotalSessions, UsedSessions,
    TotalPrice, PaidAmount, PaymentMethod, StartDate, EndDate, Status, Notes, CDate, IsActive)
VALUES
(100, 100, 105, 104, 102, 6, 3, 12000.00, 12000.00, 2, '2025-12-01', '2026-06-01', 1, N'6 seans keratin paketi', '2025-12-01', 1),
(101, 100, 100, 107, 103, 10, 7, 4000.00, 4000.00, 2, '2025-10-01', '2026-04-01', 1, N'10 seans cilt bakım paketi', '2025-10-01', 1),
(102, 100, 107, 101, 101, 4, 4, 2800.00, 2800.00, 1, '2025-09-01', '2026-03-01', 2, N'4 seans boya paketi - tamamlandı', '2025-09-01', 1),
(103, 100, 103, 109, 104, 8, 2, 4000.00, 2000.00, 1, '2026-02-01', '2026-08-01', 1, N'8 seans ağda paketi - taksitli', '2026-02-01', 1),
(104, 101, 118, 117, 109, 12, 8, 9600.00, 9600.00, 2, '2025-11-01', '2026-05-01', 1, N'12 seans anti-aging paketi', '2025-11-01', 1),
(105, 101, 112, 115, 107, 4, 2, 12000.00, 12000.00, 2, '2026-01-15', '2026-07-15', 1, N'4 seans keratin paketi', '2026-01-15', 1),
(106, 101, 116, 111, 107, 6, 5, 6000.00, 6000.00, 2, '2025-10-15', '2026-04-15', 1, N'6 seans boya + bakım paketi', '2025-10-15', 1),
(107, 101, 114, 116, 108, 10, 6, 3200.00, 3200.00, 1, '2025-12-01', '2026-06-01', 1, N'10 seans nail art paketi', '2025-12-01', 1),
(108, 101, 110, 118, 106, 8, 8, 5600.00, 5600.00, 2, '2025-10-01', '2026-02-01', 2, N'8 seans lazer epilasyon - bitti', '2025-10-01', 1),
(109, 101, 113, 110, 106, 3, 0, 1200.00, 400.00, 1, '2026-03-01', '2026-09-01', 1, N'3 seans kesim paketi - taksit', '2026-03-01', 1);

SET IDENTITY_INSERT PackageSales_Packages OFF;
GO

-- ============================================================
-- BÖLÜM 16: PAKET KULLANIMLARI (PackageSales_Usages)
-- ============================================================
SET IDENTITY_INSERT PackageSales_Usages ON;

INSERT INTO PackageSales_Usages (Id, PackageSaleId, TenantId, UsageDate, StaffId, Notes, CDate, IsActive)
VALUES
(100, 100, 100, '2026-01-05 10:00', 102, N'1. seans tamamlandı', '2026-01-05', 1),
(101, 100, 100, '2026-02-10 10:00', 102, N'2. seans tamamlandı', '2026-02-10', 1),
(102, 100, 100, '2026-03-15 10:00', 102, N'3. seans tamamlandı', '2026-03-15', 1),
(103, 101, 100, '2025-10-15 14:00', 103, NULL, '2025-10-15', 1),
(104, 101, 100, '2025-11-15 14:00', 103, NULL, '2025-11-15', 1),
(105, 101, 100, '2025-12-15 14:00', 103, NULL, '2025-12-15', 1),
(106, 101, 100, '2026-01-15 14:00', 103, NULL, '2026-01-15', 1),
(107, 101, 100, '2026-02-01 14:00', 103, NULL, '2026-02-01', 1),
(108, 101, 100, '2026-02-22 14:00', 103, NULL, '2026-02-22', 1),
(109, 101, 100, '2026-03-10 14:00', 103, N'Son seans çok başarılı', '2026-03-10', 1);

SET IDENTITY_INSERT PackageSales_Usages OFF;
GO

-- ============================================================
-- BÖLÜM 17: PAKET ÖDEMELERİ (PackageSales_Payments)
-- ============================================================
SET IDENTITY_INSERT PackageSales_Payments ON;

INSERT INTO PackageSales_Payments (Id, PackageSaleId, TenantId, Amount, PaymentMethod, PaidAt, Notes, CDate, IsActive)
VALUES
(100, 103, 100, 1000.00, 1, '2026-02-01 12:00', N'1. taksit', '2026-02-01', 1),
(101, 103, 100, 1000.00, 1, '2026-03-01 12:00', N'2. taksit', '2026-03-01', 1),
(102, 109, 101, 400.00, 1, '2026-03-01 11:00', N'Peşinat', '2026-03-01', 1);

SET IDENTITY_INSERT PackageSales_Payments OFF;
GO

-- ============================================================
-- BÖLÜM 18: PERSONEL ÇALIŞMA SAATLERİ (StaffShifts)
-- ============================================================
SET QUOTED_IDENTIFIER ON;
GO
SET IDENTITY_INSERT StaffShifts ON;

INSERT INTO StaffShifts (Id, TenantId, StaffId, DayOfWeek, StartTime, EndTime, BreakStartTime, BreakEndTime, IsWorkingDay, CDate, IsActive)
VALUES
-- Fatma (101): Pazartesi-Cumartesi
(100, 100, 101, 0, '00:00', '00:00', NULL, NULL, 0, '2025-06-15', 1),
(101, 100, 101, 1, '09:00', '18:00', '12:30', '13:30', 1, '2025-06-15', 1),
(102, 100, 101, 2, '09:00', '18:00', '12:30', '13:30', 1, '2025-06-15', 1),
(103, 100, 101, 3, '09:00', '18:00', '12:30', '13:30', 1, '2025-06-15', 1),
(104, 100, 101, 4, '09:00', '18:00', '12:30', '13:30', 1, '2025-06-15', 1),
(105, 100, 101, 5, '09:00', '18:00', '12:30', '13:30', 1, '2025-06-15', 1),
(106, 100, 101, 6, '10:00', '16:00', NULL, NULL, 1, '2025-06-15', 1),
-- Elif (102): Salı-Cumartesi
(107, 100, 102, 0, '00:00', '00:00', NULL, NULL, 0, '2025-07-01', 1),
(108, 100, 102, 1, '00:00', '00:00', NULL, NULL, 0, '2025-07-01', 1),
(109, 100, 102, 2, '10:00', '19:00', '13:00', '14:00', 1, '2025-07-01', 1),
(110, 100, 102, 3, '10:00', '19:00', '13:00', '14:00', 1, '2025-07-01', 1),
(111, 100, 102, 4, '10:00', '19:00', '13:00', '14:00', 1, '2025-07-01', 1),
(112, 100, 102, 5, '10:00', '19:00', '13:00', '14:00', 1, '2025-07-01', 1),
(113, 100, 102, 6, '10:00', '17:00', NULL, NULL, 1, '2025-07-01', 1),
-- Deniz (106): Pazartesi-Cuma
(114, 101, 106, 0, '00:00', '00:00', NULL, NULL, 0, '2025-10-01', 1),
(115, 101, 106, 1, '09:30', '18:30', '12:00', '13:00', 1, '2025-10-01', 1),
(116, 101, 106, 2, '09:30', '18:30', '12:00', '13:00', 1, '2025-10-01', 1),
(117, 101, 106, 3, '09:30', '18:30', '12:00', '13:00', 1, '2025-10-01', 1),
(118, 101, 106, 4, '09:30', '18:30', '12:00', '13:00', 1, '2025-10-01', 1),
(119, 101, 106, 5, '09:30', '18:30', '12:00', '13:00', 1, '2025-10-01', 1),
(120, 101, 106, 6, '00:00', '00:00', NULL, NULL, 0, '2025-10-01', 1);

SET IDENTITY_INSERT StaffShifts OFF;
GO

-- ============================================================
-- BÖLÜM 19: PERSONEL İZİNLERİ (StaffLeaves)
-- ============================================================
SET IDENTITY_INSERT StaffLeaves ON;

INSERT INTO StaffLeaves (Id, TenantId, StaffId, StartDate, EndDate, LeaveType, Reason, Status, ApprovedById, ApprovedDate, CDate, IsActive)
VALUES
(100, 100, 101, '2026-04-10', '2026-04-14', N'Annual', N'Bayram tatili', N'Approved', 100, '2026-03-20', '2026-03-15', 1),
(101, 100, 102, '2026-03-28', '2026-03-28', N'Sick', N'Grip', N'Approved', 100, '2026-03-28', '2026-03-28', 1),
(102, 100, 103, '2026-04-21', '2026-04-25', N'Annual', N'Yıllık izin', N'Pending', NULL, NULL, '2026-03-25', 1),
(103, 100, 104, '2026-05-01', '2026-05-02', N'Annual', N'1 Mayıs + köprü', N'Approved', 100, '2026-03-30', '2026-03-28', 1),
(104, 101, 107, '2026-04-07', '2026-04-11', N'Annual', N'Aile ziyareti', N'Approved', 105, '2026-03-25', '2026-03-20', 1),
(105, 101, 108, '2026-03-24', '2026-03-24', N'Sick', N'Diş problemi', N'Approved', 105, '2026-03-24', '2026-03-24', 1),
(106, 101, 109, '2026-04-15', '2026-04-18', N'Unpaid', N'Kişisel nedenler', N'Pending', NULL, NULL, '2026-03-29', 1),
(107, 101, 106, '2026-05-19', '2026-05-23', N'Annual', N'Tatil', N'Approved', 105, '2026-03-30', '2026-03-28', 1);

SET IDENTITY_INSERT StaffLeaves OFF;
GO

-- ============================================================
-- BÖLÜM 20: PERSONEL HR BİLGİLERİ (StaffHRInfos)
-- ============================================================
SET QUOTED_IDENTIFIER ON;
GO
SET IDENTITY_INSERT StaffHRInfos ON;

INSERT INTO StaffHRInfos (Id, TenantId, StaffId, HireDate, Position, Salary, SalaryCurrency,
    IdentityNumber, EmergencyContactName, EmergencyContactPhone, AnnualLeaveEntitlement, UsedLeaveDays, Notes, CDate, IsActive)
VALUES
(100, 100, 101, '2025-06-15', N'Kıdemli Kuaför', 28000.00, N'TRY', N'12345678901', N'Ahmet Demir', N'05551112233', 14, 3, N'10 yıl deneyimli', '2025-06-15', 1),
(101, 100, 102, '2025-07-01', N'Kuaför', 22000.00, N'TRY', N'23456789012', N'Mehmet Kaya', N'05552223344', 14, 1, NULL, '2025-07-01', 1),
(102, 100, 103, '2025-08-01', N'Güzellik Uzmanı', 25000.00, N'TRY', N'34567890123', N'Ali Öztürk', N'05553334455', 14, 0, N'Cilt bakım sertifikalı', '2025-08-01', 1),
(103, 100, 104, '2025-09-01', N'Manikür/Pedikür Uzmanı', 20000.00, N'TRY', N'45678901234', N'Veli Aksoy', N'05554445566', 14, 1, NULL, '2025-09-01', 1),
(104, 101, 106, '2025-10-01', N'Kıdemli Stilist', 35000.00, N'TRY', N'56789012345', N'Selim Arslan', N'05555556677', 14, 5, N'Uluslararası deneyim', '2025-10-01', 1),
(105, 101, 107, '2025-10-15', N'Saç Bakım Uzmanı', 30000.00, N'TRY', N'67890123456', N'Ayhan Şahin', N'05556667788', 14, 0, N'Keratin sertifikalı', '2025-10-15', 1),
(106, 101, 108, '2025-11-01', N'Nail Art Uzmanı', 24000.00, N'TRY', N'78901234567', N'Sema Yıldız', N'05557778899', 14, 1, NULL, '2025-11-01', 1),
(107, 101, 109, '2025-11-15', N'Cilt Bakım Uzmanı', 28000.00, N'TRY', N'89012345678', N'Kemal Karaca', N'05558889900', 14, 0, N'Anti-aging sertifikalı', '2025-11-15', 1);

SET IDENTITY_INSERT StaffHRInfos OFF;
GO

-- ============================================================
-- BÖLÜM 21: PERSONEL HİZMET KOMİSYONLARI
-- ============================================================
SET QUOTED_IDENTIFIER ON;
GO
SET IDENTITY_INSERT StaffTreatmentCommissions ON;

INSERT INTO StaffTreatmentCommissions (Id, TenantId, StaffId, TreatmentId, CommissionRate, CDate, IsActive)
VALUES
(100, 100, 101, 100, 30.00, '2025-06-15', 1),
(101, 100, 101, 101, 25.00, '2025-06-15', 1),
(102, 100, 101, 102, 20.00, '2025-06-15', 1),
(103, 100, 101, 103, 35.00, '2025-06-15', 1),
(104, 100, 102, 101, 25.00, '2025-07-01', 1),
(105, 100, 102, 104, 15.00, '2025-07-01', 1),
(106, 101, 106, 110, 30.00, '2025-10-01', 1),
(107, 101, 106, 117, 20.00, '2025-10-01', 1),
(108, 101, 106, 118, 15.00, '2025-10-01', 1),
(109, 101, 107, 111, 25.00, '2025-10-15', 1);

SET IDENTITY_INSERT StaffTreatmentCommissions OFF;
GO

-- ============================================================
-- BÖLÜM 22: KOMİSYON KAYITLARI
-- ============================================================
SET IDENTITY_INSERT StaffCommissionRecords ON;

INSERT INTO StaffCommissionRecords (Id, TenantId, StaffId, AppointmentPaymentId, CommissionRate,
    PaymentAmountInTry, CommissionAmountInTry, SalonShareInTry, IsPaid, PaidAt, CDate, IsActive)
VALUES
(100, 100, 101, 100, 30.00, 350.00, 105.00, 245.00, 1, '2026-03-31', '2026-03-15', 1),
(101, 100, 102, 101, 25.00, 800.00, 200.00, 600.00, 1, '2026-03-31', '2026-03-10', 1),
(102, 100, 101, 102, 20.00, 1500.00, 300.00, 1200.00, 1, '2026-03-31', '2026-03-08', 1),
(103, 100, 102, 103, 15.00, 2500.00, 375.00, 2125.00, 0, NULL, '2026-03-25', 1),
(104, 100, 101, 104, 25.00, 800.00, 200.00, 600.00, 0, NULL, '2026-03-20', 1),
(105, 101, 106, 105, 30.00, 500.00, 150.00, 350.00, 1, '2026-03-31', '2026-03-27', 1),
(106, 101, 107, 106, 25.00, 3500.00, 875.00, 2625.00, 0, NULL, '2026-03-25', 1),
(107, 101, 107, 107, 25.00, 1200.00, 300.00, 900.00, 0, NULL, '2026-03-28', 1),
(108, 101, 108, 108, 20.00, 400.00, 80.00, 320.00, 1, '2026-03-31', '2026-03-20', 1);

SET IDENTITY_INSERT StaffCommissionRecords OFF;
GO

-- ============================================================
-- BÖLÜM 23: PERSONEL MÜSAİTSİZLİKLERİ
-- ============================================================
SET IDENTITY_INSERT StaffUnavailabilities ON;

INSERT INTO StaffUnavailabilities (Id, TenantId, StaffId, StartTime, EndTime, Reason, Notes, CDate, IsActive)
VALUES
(100, 100, 101, '2026-04-01 12:00', '2026-04-01 14:00', N'Öğle Molası', N'Uzun öğle molası - doktor randevusu', '2026-03-30', 1),
(101, 100, 102, '2026-04-02 09:00', '2026-04-02 11:00', N'Toplantı', N'Ürün tanıtım toplantısı', '2026-03-28', 1),
(102, 100, 103, '2026-04-03 15:00', '2026-04-03 18:00', N'İzin', N'Erken çıkış', '2026-03-30', 1),
(103, 101, 106, '2026-04-01 09:30', '2026-04-01 11:00', N'Toplantı', N'Haftalık ekip toplantısı', '2026-03-31', 1),
(104, 101, 107, '2026-04-02 14:00', '2026-04-02 15:00', N'Hasta', N'Eczaneye gidecek', '2026-04-02', 1);

SET IDENTITY_INSERT StaffUnavailabilities OFF;
GO

-- ============================================================
-- BÖLÜM 24: MÜŞTERİ BORÇLARI (CustomerDebts)
-- ============================================================
SET IDENTITY_INSERT CustomerDebts ON;

INSERT INTO CustomerDebts (Id, TenantId, CustomerId, PersonName, Type, Amount, PaidAmount, Currency,
    Description, Notes, DueDate, Status, Source, CDate, IsActive)
VALUES
(100, 100, 103, NULL, N'Receivable', 2000.00, 0, N'TRY', N'Ağda paketi kalan borç', NULL, '2026-05-01', N'Pending', N'PackageSale', '2026-02-01', 1),
(101, 100, 106, NULL, N'Receivable', 350.00, 0, N'TRY', N'Saç kesim ücreti', N'Bir sonraki gelişinde alınacak', '2026-04-15', N'Pending', N'Appointment', '2026-03-28', 1),
(102, 100, NULL, N'Meryem Hanım (dış müşteri)', N'Receivable', 1200.00, 500.00, N'TRY', N'Gelin başı yapıldı, bakiye kaldı', NULL, '2026-04-01', N'PartiallyPaid', N'Manual', '2026-03-20', 1),
(103, 100, NULL, N'Kozmetik Dünyası Ltd.', N'Debt', 5000.00, 2000.00, N'TRY', N'Mart ayı ürün alımı fatura borcu', N'15 gün vadeli', '2026-04-15', N'PartiallyPaid', N'Manual', '2026-03-05', 1),
(104, 101, 113, NULL, N'Receivable', 800.00, 400.00, N'TRY', N'Paket peşinat bakiyesi', NULL, '2026-04-01', N'PartiallyPaid', N'PackageSale', '2026-03-01', 1),
(105, 101, 117, NULL, N'Receivable', 900.00, 0, N'TRY', N'Cilt bakım ödemesi bekliyor', N'Havale ile ödeyecek', '2026-04-05', N'Pending', N'Appointment', '2026-03-22', 1),
(106, 101, NULL, N'Beauty Supply Co.', N'Debt', 12000.00, 0, N'TRY', N'Nisan ayı stok siparişi', NULL, '2026-04-30', N'Pending', N'Manual', '2026-03-25', 1),
(107, 100, 102, NULL, N'Receivable', 500.00, 0, N'TRY', N'Geçen ayki pedikür ücreti', N'3 kez arandı, ulaşılamadı', '2026-03-15', N'Overdue', N'Appointment', '2026-02-22', 1),
(108, 101, 115, NULL, N'Receivable', 1600.00, 0, N'TRY', N'2 seans bakım ücreti', N'Telefon açmıyor', '2026-03-01', N'Overdue', N'Appointment', '2026-01-10', 1);

SET IDENTITY_INSERT CustomerDebts OFF;
GO

-- ============================================================
-- BÖLÜM 25: BORÇ ÖDEMELERİ
-- ============================================================
SET IDENTITY_INSERT CustomerDebtPayments ON;

INSERT INTO CustomerDebtPayments (Id, TenantId, CustomerDebtId, Amount, PaymentMethod, Notes, PaymentDate, CDate, IsActive)
VALUES
(100, 100, 102, 500.00, N'BankTransfer', N'Havale ile ödendi', '2026-03-25', '2026-03-25', 1),
(101, 100, 103, 2000.00, N'BankTransfer', N'İlk taksit havale', '2026-03-20', '2026-03-20', 1),
(102, 101, 104, 400.00, N'Cash', N'Nakit ödeme', '2026-03-15', '2026-03-15', 1);

SET IDENTITY_INSERT CustomerDebtPayments OFF;
GO

-- ============================================================
-- BÖLÜM 26: BİLDİRİM KURALLARI
-- ============================================================
SET IDENTITY_INSERT TenantNotificationRules ON;

INSERT INTO TenantNotificationRules (Id, TenantId, Channel, IsActive, CDate)
VALUES
(100, 100, 1, 1, '2025-06-01'),
(101, 100, 2, 1, '2025-06-01'),
(102, 100, 3, 1, '2025-06-01'),
(103, 100, 4, 0, '2025-06-01'),
(104, 101, 1, 1, '2025-09-15'),
(105, 101, 2, 1, '2025-09-15'),
(106, 101, 3, 1, '2025-09-15'),
(107, 101, 4, 1, '2025-09-15');

SET IDENTITY_INSERT TenantNotificationRules OFF;
GO

-- ============================================================
-- BÖLÜM 27: UYGULAMA İÇİ BİLDİRİMLER
-- ============================================================
SET IDENTITY_INSERT InAppNotifications ON;

INSERT INTO InAppNotifications (Id, TenantId, UserId, Title, Message, Type, EntityType, EntityId,
    IsRead, ReadAt, ActionUrl, DeduplicationKey, CDate, IsActive)
VALUES
(100, 100, 100, N'Yeni randevu', N'Şeyma Aydın yarın 09:00 için randevu aldı', N'info', N'Appointment', 105, 0, NULL, N'/appointments', N'APPOINTMENT_NEW_105_20260328', '2026-03-28', 1),
(101, 100, 101, N'Randevu hatırlatma', N'Bugün saat 09:00 - Şeyma Aydın - Fön', N'info', N'Appointment', 105, 1, '2026-03-31 08:00', N'/appointments', N'APPOINTMENT_REMIND_105_20260331', '2026-03-31', 1),
(102, 100, 100, N'İzin talebi', N'Zeynep Öztürk 21-25 Nisan arası yıllık izin talep etti', N'warning', N'StaffLeave', 102, 0, NULL, N'/staff/leaves', N'LEAVE_NEW_102_20260325', '2026-03-25', 1),
(103, 100, NULL, N'Yeni ürün stokta', N'Moroccanoil yağı stok yenilendi - 12 adet', N'success', N'Product', 104, 0, NULL, NULL, N'PRODUCT_STOCK_104_20260320', '2026-03-20', 1),
(104, 100, 100, N'Borç hatırlatma', N'Canan Polat - 500 TL borç vadesi geçmiş!', N'error', N'CustomerDebt', 107, 0, NULL, N'/debts', N'DEBT_OVERDUE_107_20260316', '2026-03-16', 1),
(105, 101, 105, N'Yeni randevu', N'Beren Saat bugün 10:00 için onaylandı', N'info', N'Appointment', 115, 1, '2026-03-31 09:00', N'/appointments', N'APPOINTMENT_CONFIRM_115_20260331', '2026-03-31', 1),
(106, 101, 105, N'Paket tamamlandı', N'Beren Saat - 8 seans lazer epilasyon paketi tamamlandı', N'success', N'PackageSale', 108, 0, NULL, N'/packages', N'PACKAGE_DONE_108_20260201', '2026-02-01', 1),
(107, 101, 105, N'Komisyon raporu', N'Mart ayı komisyon raporu hazır - toplam: 1,405 TL', N'info', NULL, NULL, 0, NULL, N'/reports/commissions', N'COMMISSION_REPORT_202603', '2026-03-31', 1),
(108, 101, 106, N'NoShow uyarısı', N'Tuba Büyüküstün randevuya gelmedi', N'warning', N'Appointment', 119, 1, '2026-03-18 12:00', N'/appointments', N'APPOINTMENT_NOSHOW_119_20260318', '2026-03-18', 1),
(109, 101, 105, N'Vadesi geçen borç', N'Tuba Büyüküstün - 1,600 TL borç vadesi geçmiş', N'error', N'CustomerDebt', 108, 0, NULL, N'/debts', N'DEBT_OVERDUE_108_20260301', '2026-03-01', 1);

SET IDENTITY_INSERT InAppNotifications OFF;
GO

-- ============================================================
-- BÖLÜM 28: TENANT ÖDEME GEÇMİŞİ
-- ============================================================
SET IDENTITY_INSERT TenantPaymentHistories ON;

INSERT INTO TenantPaymentHistories (Id, TenantId, SubscriptionId, Amount, PaymentDate, PaymentStatus,
    PaymentMethod, Description, TransactionId, IsRefunded, CDate, IsActive)
VALUES
(100, 100, 100, 1000.00, '2025-06-01', N'Success', N'CreditCard', N'Gold Paketi - İlk ödeme', N'TXN-GD-100-001', 0, '2025-06-01', 1),
(101, 100, 100, 1000.00, '2025-07-01', N'Success', N'CreditCard', N'Gold Paketi - Aylık', N'TXN-GD-100-002', 0, '2025-07-01', 1),
(102, 100, 100, 1000.00, '2025-08-01', N'Success', N'CreditCard', N'Gold Paketi - Aylık', N'TXN-GD-100-003', 0, '2025-08-01', 1),
(103, 100, 100, 1000.00, '2025-09-01', N'Failed', N'CreditCard', N'Gold Paketi - Kart limiti', N'TXN-GD-100-004', 0, '2025-09-01', 1),
(104, 100, 100, 1000.00, '2025-09-03', N'Success', N'CreditCard', N'Gold Paketi - Tekrar deneme', N'TXN-GD-100-005', 0, '2025-09-03', 1),
(105, 101, 101, 2000.00, '2025-09-15', N'Success', N'CreditCard', N'Platinum Paketi - İlk ödeme', N'TXN-PL-101-001', 0, '2025-09-15', 1),
(106, 101, 101, 2000.00, '2025-10-15', N'Success', N'CreditCard', N'Platinum Paketi - Aylık', N'TXN-PL-101-002', 0, '2025-10-15', 1),
(107, 101, 101, 2000.00, '2025-11-15', N'Success', N'CreditCard', N'Platinum Paketi - Aylık', N'TXN-PL-101-003', 0, '2025-11-15', 1),
(108, 101, 101, 2000.00, '2025-12-15', N'Success', N'CreditCard', N'Platinum Paketi - Aylık', N'TXN-PL-101-004', 0, '2025-12-15', 1);

SET IDENTITY_INSERT TenantPaymentHistories OFF;
GO

-- ============================================================
-- BÖLÜM 29: DAVET TOKENLERİ
-- ============================================================
SET IDENTITY_INSERT TenantInviteTokens ON;

INSERT INTO TenantInviteTokens (Id, TenantId, TokenCode, EmailToInvite, ExpireDate, IsUsed, CDate, IsActive)
VALUES
(100, 100, N'GD2026A1', N'yeni.personel@gmail.com', '2026-04-15', 0, '2026-03-25', 1),
(101, 100, N'GD2026B2', NULL, '2026-04-30', 0, '2026-03-28', 1),
(102, 100, N'GD2025X1', N'fatma.demir@guzellikdunyasi.com', '2025-07-01', 1, '2025-06-10', 1),
(103, 101, N'EB2026C3', N'stajyer@elitebeauty.com', '2026-04-10', 0, '2026-03-30', 1),
(104, 101, N'EB2025Y1', N'deniz.arslan@elitebeauty.com', '2025-10-15', 1, '2025-09-20', 1);

SET IDENTITY_INSERT TenantInviteTokens OFF;
GO

-- ============================================================
-- BÖLÜM 30: KULLANICI BİLDİRİM TERCİHLERİ
-- ============================================================
SET IDENTITY_INSERT UserNotificationPreferences ON;

INSERT INTO UserNotificationPreferences (Id, AppUserId, Channel, IsEnabled, CDate, IsActive)
VALUES
(100, 100, 1, 1, '2025-06-01', 1),
(101, 100, 2, 1, '2025-06-01', 1),
(102, 100, 3, 1, '2025-06-01', 1),
(103, 101, 1, 0, '2025-06-15', 1),
(104, 101, 2, 1, '2025-06-15', 1),
(105, 101, 3, 1, '2025-06-15', 1),
(106, 105, 1, 1, '2025-09-15', 1),
(107, 105, 2, 1, '2025-09-15', 1),
(108, 105, 3, 1, '2025-09-15', 1),
(109, 105, 4, 1, '2025-09-15', 1);

SET IDENTITY_INSERT UserNotificationPreferences OFF;
GO

PRINT N'Tum test verileri basariyla eklendi!';
GO
