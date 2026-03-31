-- ============================================================
-- Glow Atelier (Tenant 4) - Kapsamlı Test Verisi
-- Mevcut: 4 user (4,5,7,8), 3 müşteri (2,3,4), 2 hizmet (2,3)
--         12 randevu (2-13), 2 ürün (1,2), 2 ödeme, 21 vardiya
-- Yeni ID aralığı: 200+
-- ============================================================
SET QUOTED_IDENTIFIER ON;
GO
USE BeautyWise;
GO

-- ============================================================
-- 1: ŞUBE (Branches) - Henüz şube yok, ana şube ekle
-- ============================================================
SET IDENTITY_INSERT Branches ON;

INSERT INTO Branches (Id, TenantId, Name, Address, Phone, Email, IsMainBranch, CDate, IsActive)
VALUES
(200, 4, N'Merkez Şube', N'Nişantaşı Abdi İpekçi Cad. No:15 Şişli/İstanbul', N'05528658832', N'info@glowatelier.com', 1, '2025-06-01', 1);

SET IDENTITY_INSERT Branches OFF;
GO

-- Kullanıcıları şubeye bağla
UPDATE Users SET BranchId = 200 WHERE TenantId = 4 AND BranchId IS NULL;
GO

-- ============================================================
-- 2: YENİ MÜŞTERİLER (+7 tane, mevcut 3 ile toplam 10)
-- ============================================================
SET IDENTITY_INSERT Customers ON;

INSERT INTO Customers (Id, TenantId, Name, Surname, Phone, Email, BirthDate, Notes,
    LoyaltyPoints, TotalSpent, TotalVisits, LastVisitDate, CustomerSince,
    PreferredStaffId, Allergies, Tags, ReferralSource, CDate, IsActive)
VALUES
(200, 4, N'Elif', N'Yıldırım', N'05421112233', N'elif.yildirim@gmail.com', '1991-06-15',
    N'Her ay düzenli saç bakımı', 280, 5200.00, 14, '2026-03-28', '2025-07-10',
    5, NULL, N'["VIP","Düzenli"]', N'Instagram', '2025-07-10', 1),

(201, 4, N'Zehra', N'Aksoy', N'05422223344', N'zehra.aksoy@hotmail.com', '1987-02-20',
    N'Hassas cilt - dikkat', 150, 3100.00, 8, '2026-03-22', '2025-09-05',
    8, N'Paraben içeren ürünler', N'["Düzenli","Hassas cilt"]', N'Google', '2025-09-05', 1),

(202, 4, N'Selin', N'Demir', N'05423334455', NULL, '1995-11-03',
    N'Gelin adayı - paket bakım', 320, 6800.00, 16, '2026-03-25', '2025-08-20',
    5, NULL, N'["VIP","Gelin","Paket"]', N'Arkadaş tavsiyesi', '2025-08-20', 1),

(203, 4, N'Büşra', N'Çelik', N'05424445566', N'busra.celik@yahoo.com', '1993-08-12',
    NULL, 90, 1500.00, 4, '2026-02-15', '2025-12-01',
    NULL, NULL, N'["Yeni"]', N'TikTok', '2025-12-01', 1),

(204, 4, N'Nur', N'Şahin', N'05425556677', N'nur.sahin@gmail.com', '1980-04-28',
    N'Anti-aging cilt bakımı düzenli', 400, 9200.00, 22, '2026-03-30', '2025-06-15',
    7, NULL, N'["VIP","Premium","Cilt bakım"]', N'Referans', '2025-06-15', 1),

(205, 4, N'Gamze', N'Kılıç', N'05426667788', NULL, '1998-01-17',
    N'Sadece hafta sonları', 60, 800.00, 3, '2026-03-08', '2026-01-10',
    NULL, NULL, N'["Hafta sonu"]', N'Google', '2026-01-10', 1),

(206, 4, N'Aylin', N'Öztürk', N'05427778899', N'aylin.o@outlook.com', '1989-09-22',
    N'Keratin bakım müdavimi', 350, 7500.00, 18, '2026-03-26', '2025-07-25',
    5, N'Formaldehit bazlı ürünler', N'["VIP","Düzenli","Keratin"]', N'Instagram', '2025-07-25', 1);

SET IDENTITY_INSERT Customers OFF;
GO

-- ============================================================
-- 3: YENİ HİZMETLER (+8 tane, mevcut 2 ile toplam 10)
-- Mevcut: 2=Saç Boyama(500.30/90dk), 3=Jel Tırnak(560/45dk)
-- ============================================================
SET IDENTITY_INSERT Treatments ON;

INSERT INTO Treatments (Id, TenantId, Name, Description, DurationMinutes, Price, Color, CDate, IsActive)
VALUES
(200, 4, N'Saç Kesimi (Kadın)', N'Yıkama, kesim ve fön dahil', 60, 400.00, N'#FF6B6B', '2025-06-01', 1),
(201, 4, N'Röfle / Balyaj', N'Modern röfle ve balyaj teknikleri', 120, 1600.00, N'#45B7D1', '2025-06-01', 1),
(202, 4, N'Keratin Bakım', N'Brezilya keratin saç bakımı', 150, 2800.00, N'#FFEAA7', '2025-06-01', 1),
(203, 4, N'Fön', N'Yıkama ve fön', 30, 180.00, N'#96CEB4', '2025-06-01', 1),
(204, 4, N'Cilt Bakımı', N'Derin cilt temizliği ve bakım', 75, 600.00, N'#F7DC6F', '2025-06-01', 1),
(205, 4, N'Manikür', N'Klasik manikür uygulaması', 45, 250.00, N'#DDA0DD', '2025-06-01', 1),
(206, 4, N'Kaş Dizaynı', N'Kaş şekillendirme ve alma', 20, 120.00, N'#BB8FCE', '2025-06-01', 1),
(207, 4, N'Ağda (Tüm Vücut)', N'Tam vücut ağda uygulaması', 90, 700.00, N'#F1948A', '2025-06-01', 1);

SET IDENTITY_INSERT Treatments OFF;
GO

-- ============================================================
-- 4: YENİ RANDEVULAR (+8 tane, mevcut 12 ile toplam 20)
-- Karışık: geçmiş tamamlanmış + bugün + gelecek + iptal + noshow
-- StaffId: 4(Mehmet), 5(Ahmet), 7(Gökhan), 8(Özge)
-- ============================================================
SET IDENTITY_INSERT Appointments ON;

INSERT INTO Appointments (Id, TenantId, CustomerId, StaffId, TreatmentId, StartTime, EndTime,
    Status, Notes, IsRecurring, SessionNumber, CDate, IsActive)
VALUES
-- Geçmiş tamamlanmış
(200, 4, 200, 5, 200, '2026-03-28 10:00', '2026-03-28 11:00', 3, N'Katmanlı kesim', 0, 1, '2026-03-25', 1),
(201, 4, 204, 7, 204, '2026-03-30 14:00', '2026-03-30 15:15', 3, N'Anti-aging cilt bakımı', 0, 1, '2026-03-28', 1),
(202, 4, 206, 5, 202, '2026-03-26 09:00', '2026-03-26 11:30', 3, N'Keratin bakım seansı', 0, 1, '2026-03-24', 1),
-- Bugün
(203, 4, 202, 8, 3, '2026-03-31 11:00', '2026-03-31 11:45', 2, N'Gelin jel tırnak denemesi', 0, 1, '2026-03-29', 1),
(204, 4, 201, 7, 204, '2026-03-31 15:00', '2026-03-31 16:15', 1, N'Hassas cilt bakımı', 0, 1, '2026-03-30', 1),
-- Gelecek
(205, 4, 200, 5, 201, '2026-04-03 10:00', '2026-04-03 12:00', 1, N'Balyaj - bal tonları', 0, 1, '2026-03-31', 1),
-- İptal
(206, 4, 203, 5, 200, '2026-03-20 14:00', '2026-03-20 15:00', 4, N'Müşteri iptal etti', 0, 1, '2026-03-18', 1),
-- NoShow
(207, 4, 205, 8, 205, '2026-03-15 11:00', '2026-03-15 11:45', 5, N'Gelmedi, aranacak', 0, 1, '2026-03-13', 1);

SET IDENTITY_INSERT Appointments OFF;
GO

-- ============================================================
-- 5: RANDEVU ÖDEMELERİ (+6 tane, mevcut 2 ile toplam 8)
-- ============================================================
SET IDENTITY_INSERT AppointmentPayments ON;

INSERT INTO AppointmentPayments (Id, TenantId, AppointmentId, Amount, CurrencyId, ExchangeRateToTry, AmountInTry,
    PaymentMethod, PaidAt, Notes, CDate, IsActive)
VALUES
(200, 4, 200, 400.00, 1, 1, 400.00, 1, '2026-03-28 11:00', N'Nakit ödendi', '2026-03-28', 1),
(201, 4, 201, 600.00, 1, 1, 600.00, 2, '2026-03-30 15:15', N'Kredi kartı', '2026-03-30', 1),
(202, 4, 202, 2800.00, 1, 1, 2800.00, 2, '2026-03-26 11:30', N'Visa ile', '2026-03-26', 1),
-- Dövizle ödeme örneği
(203, 4, 200, 10.00, 2, 34.00, 340.00, 1, '2026-03-28 11:05', N'USD bahşiş', '2026-03-28', 1),
-- Mevcut randevu 3 için ödeme (tamamlanmış randevu ID=2, zaten 2 ödeme var)
-- Mevcut randevu 9 jel tırnak
(204, 4, 9, 560.00, 1, 1, 560.00, 2, '2026-03-30 18:45', N'Kart ile ödendi', '2026-03-30', 1),
(205, 4, 12, 560.00, 1, 1, 560.00, 1, '2026-04-04 18:45', N'Nakit', '2026-04-04', 1);

SET IDENTITY_INSERT AppointmentPayments OFF;
GO

-- ============================================================
-- 6: YENİ ÜRÜNLER (+8 tane, mevcut 2 ile toplam 10)
-- ============================================================
SET IDENTITY_INSERT Products ON;

INSERT INTO Products (Id, TenantId, Name, Description, Barcode, Price, StockQuantity, CDate, IsActive)
VALUES
(200, 4, N'Kérastase Nutritive Şampuan 250ml', N'Kuru saçlar için besleyici şampuan', N'3474636678901', 680.00, 18, '2025-06-01', 1),
(201, 4, N'Olaplex No.3 Hair Perfector', N'Ev bakımı için bağ onarıcı', N'8966789012345', 750.00, 12, '2025-06-01', 1),
(202, 4, N'Moroccanoil Saç Bakım Yağı 100ml', N'Argan yağı bazlı saç bakım', N'7290014567890', 550.00, 15, '2025-06-01', 1),
(203, 4, N'OPI Nail Lacquer - Big Apple Red', N'Premium oje', N'0619828456789', 320.00, 30, '2025-06-01', 1),
(204, 4, N'La Roche-Posay Effaclar Duo+', N'Akne bakım kremi 40ml', N'3337875598012', 590.00, 10, '2025-06-01', 1),
(205, 4, N'GHD Isı Koruyucu Sprey 120ml', N'Saçı ısıdan koruyan sprey', N'5060034890123', 420.00, 20, '2025-06-01', 1),
(206, 4, N'Wella Professionals Saç Spreyi 300ml', N'Güçlü tutuş sprey', N'8005610345678', 230.00, 25, '2025-06-01', 1),
(207, 4, N'Schwarzkopf BC Saç Maskesi 200ml', N'Yoğun nemlendirici maske', N'4045787234567', 350.00, 14, '2025-06-01', 1);

SET IDENTITY_INSERT Products OFF;
GO

-- ============================================================
-- 7: ÜRÜN SATIŞLARI (10 adet)
-- ============================================================
SET IDENTITY_INSERT ProductSales ON;

INSERT INTO ProductSales (Id, TenantId, ProductId, CustomerId, StaffId, Quantity, UnitPrice, TotalAmount,
    CurrencyId, ExchangeRateToTry, AmountInTry, PaymentMethod, SaleDate, Notes, CDate, IsActive)
VALUES
(200, 4, 200, 200, 5, 1, 680.00, 680.00, 1, 1, 680.00, 2, '2026-03-28 11:15', N'Saç kesimi sonrası', '2026-03-28', 1),
(201, 4, 202, 206, 5, 1, 550.00, 550.00, 1, 1, 550.00, 2, '2026-03-26 11:45', N'Keratin sonrası ev bakımı', '2026-03-26', 1),
(202, 4, 201, 204, 7, 1, 750.00, 750.00, 1, 1, 750.00, 2, '2026-03-30 15:20', N'Cilt bakım sonrası', '2026-03-30', 1),
(203, 4, 203, 202, 8, 2, 320.00, 640.00, 1, 1, 640.00, 1, '2026-03-25 12:00', N'2 farklı renk oje', '2026-03-25', 1),
(204, 4, 1, 2, 5, 3, 189.90, 569.70, 1, 1, 569.70, 1, '2026-03-24 12:45', N'3 adet şampuan', '2026-03-24', 1),
(205, 4, 2, 204, 7, 1, 320.00, 320.00, 1, 1, 320.00, 2, '2026-03-20 16:00', NULL, '2026-03-20', 1),
(206, 4, 205, 201, 8, 1, 420.00, 420.00, 1, 1, 420.00, 1, '2026-03-22 15:30', N'Fön öncesi sprey', '2026-03-22', 1),
(207, 4, 207, 200, 5, 2, 350.00, 700.00, 1, 1, 700.00, 2, '2026-03-15 14:00', N'2 adet maske', '2026-03-15', 1),
(208, 4, 206, NULL, 4, 1, 230.00, 230.00, 1, 1, 230.00, 1, '2026-03-18 17:00', N'Kayıtsız müşteri', '2026-03-18', 1),
(209, 4, 204, 204, 7, 1, 590.00, 590.00, 1, 1, 590.00, 2, '2026-03-10 16:30', N'Anti-aging bakım ürünü', '2026-03-10', 1);

SET IDENTITY_INSERT ProductSales OFF;
GO

-- ============================================================
-- 8: GİDER KATEGORİLERİ (10 adet)
-- ============================================================
SET IDENTITY_INSERT ExpenseCategories ON;

INSERT INTO ExpenseCategories (Id, TenantId, Name, Color, CDate, IsActive)
VALUES
(200, 4, N'Kira', N'#E74C3C', '2025-06-01', 1),
(201, 4, N'Malzeme/Ürün Alımı', N'#3498DB', '2025-06-01', 1),
(202, 4, N'Personel Maaşı', N'#2ECC71', '2025-06-01', 1),
(203, 4, N'Elektrik Faturası', N'#F39C12', '2025-06-01', 1),
(204, 4, N'Su Faturası', N'#1ABC9C', '2025-06-01', 1),
(205, 4, N'Doğalgaz Faturası', N'#E67E22', '2025-06-01', 1),
(206, 4, N'Reklam/Pazarlama', N'#9B59B6', '2025-06-01', 1),
(207, 4, N'Bakım/Onarım', N'#95A5A6', '2025-06-01', 1),
(208, 4, N'Vergi/Sigorta', N'#34495E', '2025-06-01', 1),
(209, 4, N'Diğer', N'#BDC3C7', '2025-06-01', 1);

SET IDENTITY_INSERT ExpenseCategories OFF;
GO

-- ============================================================
-- 9: GİDERLER (10 adet)
-- ============================================================
SET IDENTITY_INSERT Expenses ON;

INSERT INTO Expenses (Id, TenantId, ExpenseCategoryId, Amount, CurrencyId, ExchangeRateToTry, AmountInTry,
    Description, ExpenseDate, ReceiptNumber, Notes, CDate, IsActive)
VALUES
(200, 4, 200, 18000.00, 1, 1, 18000.00, N'Mart 2026 dükkan kirası', '2026-03-01', N'KR-2026-03', NULL, '2026-03-01', 1),
(201, 4, 201, 12500.00, 1, 1, 12500.00, N'Kérastase + Olaplex toptan sipariş', '2026-03-05', N'FAT-2026-0305', N'Aylık stok yenilemesi', '2026-03-05', 1),
(202, 4, 203, 3200.00, 1, 1, 3200.00, N'Mart elektrik faturası', '2026-03-15', N'ELK-2026-03', NULL, '2026-03-15', 1),
(203, 4, 204, 950.00, 1, 1, 950.00, N'Mart su faturası', '2026-03-15', N'SU-2026-03', NULL, '2026-03-15', 1),
(204, 4, 205, 1800.00, 1, 1, 1800.00, N'Mart doğalgaz faturası', '2026-03-18', N'DG-2026-03', NULL, '2026-03-18', 1),
(205, 4, 206, 4500.00, 1, 1, 4500.00, N'Instagram + TikTok reklam - Mart', '2026-03-01', NULL, N'Story + Reels reklam kampanyası', '2026-03-01', 1),
(206, 4, 202, 25000.00, 1, 1, 25000.00, N'Ahmet - Mart maaşı', '2026-03-28', N'MAAS-AHM-03', NULL, '2026-03-28', 1),
(207, 4, 202, 22000.00, 1, 1, 22000.00, N'Özge - Mart maaşı', '2026-03-28', N'MAAS-OZG-03', NULL, '2026-03-28', 1),
(208, 4, 207, 2200.00, 1, 1, 2200.00, N'Klima bakım ve onarım', '2026-03-20', N'SRV-2026-0320', N'Yıllık bakım + gaz dolumu', '2026-03-20', 1),
(209, 4, 201, 380.00, 2, 34.00, 12920.00, N'Olaplex import order', '2026-03-12', N'INV-OPX-0312', N'USD ile ödendi', '2026-03-12', 1);

SET IDENTITY_INSERT Expenses OFF;
GO

-- ============================================================
-- 10: PAKET SATIŞLARI (10 adet)
-- ============================================================
SET IDENTITY_INSERT PackageSales_Packages ON;

INSERT INTO PackageSales_Packages (Id, TenantId, CustomerId, TreatmentId, StaffId, TotalSessions, UsedSessions,
    TotalPrice, PaidAmount, PaymentMethod, StartDate, EndDate, Status, Notes, CDate, IsActive)
VALUES
-- Aktif paketler
(200, 4, 206, 202, 5, 6, 3, 14000.00, 14000.00, 2, '2025-12-01', '2026-06-01', 1, N'6 seans keratin paketi', '2025-12-01', 1),
(201, 4, 204, 204, 7, 10, 7, 5000.00, 5000.00, 2, '2025-10-01', '2026-04-01', 1, N'10 seans cilt bakım paketi', '2025-10-01', 1),
(202, 4, 202, 3, 8, 8, 4, 3600.00, 3600.00, 2, '2025-11-15', '2026-05-15', 1, N'8 seans jel tırnak paketi - gelin', '2025-11-15', 1),
(203, 4, 200, 207, 8, 8, 2, 4800.00, 2400.00, 1, '2026-02-01', '2026-08-01', 1, N'8 seans ağda paketi - taksitli', '2026-02-01', 1),
(204, 4, 2, 2, 5, 6, 4, 2600.00, 2600.00, 2, '2025-10-15', '2026-04-15', 1, N'6 seans boya paketi - Ayşe', '2025-10-15', 1),
-- Tamamlanmış
(205, 4, 204, 204, 7, 4, 4, 2000.00, 2000.00, 2, '2025-07-01', '2025-11-01', 2, N'4 seans cilt bakım - tamamlandı', '2025-07-01', 1),
(206, 4, 200, 200, 5, 3, 3, 1000.00, 1000.00, 1, '2025-09-01', '2025-12-01', 2, N'3 seans saç kesim - bitti', '2025-09-01', 1),
-- Süresi dolmuş
(207, 4, 203, 205, 8, 6, 1, 1200.00, 1200.00, 1, '2025-06-01', '2025-12-01', 3, N'6 seans manikür - süre doldu', '2025-06-01', 1),
-- İptal edilmiş
(208, 4, 205, 200, 5, 4, 0, 1400.00, 700.00, 1, '2026-01-15', '2026-07-15', 4, N'İptal - müşteri taşındı', '2026-01-15', 1),
-- Yeni başlayan taksitli
(209, 4, 201, 202, 5, 4, 0, 9600.00, 3200.00, 1, '2026-03-20', '2026-09-20', 1, N'4 seans keratin - 3 taksit', '2026-03-20', 1);

SET IDENTITY_INSERT PackageSales_Packages OFF;
GO

-- ============================================================
-- 11: PAKET KULLANIM GEÇMİŞİ
-- ============================================================
SET IDENTITY_INSERT PackageSales_Usages ON;

INSERT INTO PackageSales_Usages (Id, PackageSaleId, TenantId, UsageDate, StaffId, Notes, CDate, IsActive)
VALUES
-- Paket 200 (keratin 3/6)
(200, 200, 4, '2026-01-10 10:00', 5, N'1. seans', '2026-01-10', 1),
(201, 200, 4, '2026-02-15 10:00', 5, N'2. seans', '2026-02-15', 1),
(202, 200, 4, '2026-03-26 09:00', 5, N'3. seans', '2026-03-26', 1),
-- Paket 201 (cilt bakım 7/10)
(203, 201, 4, '2025-10-15 14:00', 7, NULL, '2025-10-15', 1),
(204, 201, 4, '2025-11-12 14:00', 7, NULL, '2025-11-12', 1),
(205, 201, 4, '2025-12-10 14:00', 7, NULL, '2025-12-10', 1),
(206, 201, 4, '2026-01-14 14:00', 7, NULL, '2026-01-14', 1),
(207, 201, 4, '2026-02-04 14:00', 7, NULL, '2026-02-04', 1),
(208, 201, 4, '2026-02-25 14:00', 7, NULL, '2026-02-25', 1),
(209, 201, 4, '2026-03-30 14:00', 7, N'Anti-aging serum eklendi', '2026-03-30', 1);

SET IDENTITY_INSERT PackageSales_Usages OFF;
GO

-- ============================================================
-- 12: PAKET ÖDEMELERİ (taksitli olanlar)
-- ============================================================
SET IDENTITY_INSERT PackageSales_Payments ON;

INSERT INTO PackageSales_Payments (Id, PackageSaleId, TenantId, Amount, PaymentMethod, PaidAt, Notes, CDate, IsActive)
VALUES
-- Paket 203 (ağda taksitli: 2400/4800)
(200, 203, 4, 1200.00, 1, '2026-02-01 12:00', N'1. taksit', '2026-02-01', 1),
(201, 203, 4, 1200.00, 1, '2026-03-01 12:00', N'2. taksit', '2026-03-01', 1),
-- Paket 208 (iptal - peşinat ödenmişti)
(202, 208, 4, 700.00, 1, '2026-01-15 11:00', N'Peşinat', '2026-01-15', 1),
-- Paket 209 (keratin taksitli: 3200/9600)
(203, 209, 4, 3200.00, 2, '2026-03-20 16:00', N'1. taksit - kart ile', '2026-03-20', 1);

SET IDENTITY_INSERT PackageSales_Payments OFF;
GO

-- ============================================================
-- 13: PERSONEL HR BİLGİLERİ (3 staff: 5,7,8 - Mehmet owner)
-- ============================================================
SET QUOTED_IDENTIFIER ON;
GO
SET IDENTITY_INSERT StaffHRInfos ON;

INSERT INTO StaffHRInfos (Id, TenantId, StaffId, HireDate, Position, Salary, SalaryCurrency,
    IdentityNumber, EmergencyContactName, EmergencyContactPhone, AnnualLeaveEntitlement, UsedLeaveDays, Notes, CDate, IsActive)
VALUES
(200, 4, 5, '2025-06-15', N'Kıdemli Kuaför', 25000.00, N'TRY', N'11223344556', N'Fatma Kara', N'05551112233', 14, 2, N'Saç boyama ve keratin uzmanı', '2025-06-15', 1),
(201, 4, 7, '2025-07-01', N'Cilt Bakım Uzmanı', 28000.00, N'TRY', N'22334455667', N'Ayşe Mülayim', N'05552223344', 14, 1, N'Anti-aging sertifikalı', '2025-07-01', 1),
(202, 4, 8, '2025-08-01', N'Tırnak/Güzellik Uzmanı', 22000.00, N'TRY', N'33445566778', N'Hasan Durgut', N'05553334455', 14, 0, N'Jel tırnak ve nail art uzmanı', '2025-08-01', 1);

SET IDENTITY_INSERT StaffHRInfos OFF;
GO

-- ============================================================
-- 14: EK PERSONEL KOMİSYON ORANLARI (mevcut 1 tane var)
-- ============================================================
SET QUOTED_IDENTIFIER ON;
GO
SET IDENTITY_INSERT StaffTreatmentCommissions ON;

INSERT INTO StaffTreatmentCommissions (Id, TenantId, StaffId, TreatmentId, CommissionRate, CDate, IsActive)
VALUES
-- Ahmet (5): Saç işlemleri
(200, 4, 5, 200, 30.00, '2025-06-15', 1),  -- Saç Kesimi %30
(201, 4, 5, 201, 20.00, '2025-06-15', 1),  -- Röfle %20
(202, 4, 5, 202, 15.00, '2025-06-15', 1),  -- Keratin %15
(203, 4, 5, 203, 35.00, '2025-06-15', 1),  -- Fön %35
-- Gökhan (7): Cilt bakımı
(204, 4, 7, 204, 25.00, '2025-07-01', 1),  -- Cilt Bakımı %25
(205, 4, 7, 206, 30.00, '2025-07-01', 1),  -- Kaş Dizaynı %30
-- Özge (8): Tırnak + güzellik
(206, 4, 8, 205, 30.00, '2025-08-01', 1),  -- Manikür %30
(207, 4, 8, 207, 20.00, '2025-08-01', 1),  -- Ağda %20
(208, 4, 8, 206, 35.00, '2025-08-01', 1);  -- Kaş Dizaynı %35

SET IDENTITY_INSERT StaffTreatmentCommissions OFF;
GO

-- ============================================================
-- 15: KOMİSYON KAYITLARI (+6, mevcut 2)
-- ============================================================
SET IDENTITY_INSERT StaffCommissionRecords ON;

INSERT INTO StaffCommissionRecords (Id, TenantId, StaffId, AppointmentPaymentId, CommissionRate,
    PaymentAmountInTry, CommissionAmountInTry, SalonShareInTry, IsPaid, PaidAt, CDate, IsActive)
VALUES
(200, 4, 5, 200, 30.00, 400.00, 120.00, 280.00, 1, '2026-03-31', '2026-03-28', 1),
(201, 4, 7, 201, 25.00, 600.00, 150.00, 450.00, 1, '2026-03-31', '2026-03-30', 1),
(202, 4, 5, 202, 15.00, 2800.00, 420.00, 2380.00, 0, NULL, '2026-03-26', 1),
(203, 4, 8, 204, 30.00, 560.00, 168.00, 392.00, 0, NULL, '2026-03-30', 1),
(204, 4, 8, 205, 30.00, 560.00, 168.00, 392.00, 0, NULL, '2026-04-04', 1);

SET IDENTITY_INSERT StaffCommissionRecords OFF;
GO

-- ============================================================
-- 16: PERSONEL MÜSAİTSİZLİKLERİ (5 adet)
-- ============================================================
SET IDENTITY_INSERT StaffUnavailabilities ON;

INSERT INTO StaffUnavailabilities (Id, TenantId, StaffId, StartTime, EndTime, Reason, Notes, CDate, IsActive)
VALUES
(200, 4, 5, '2026-04-01 12:00', '2026-04-01 14:00', N'Öğle Molası', N'Doktor randevusu', '2026-03-30', 1),
(201, 4, 7, '2026-04-02 09:30', '2026-04-02 11:00', N'Toplantı', N'Ürün tanıtım toplantısı', '2026-03-28', 1),
(202, 4, 8, '2026-04-03 15:00', '2026-04-03 18:00', N'İzin', N'Erken çıkış - kişisel', '2026-03-30', 1),
(203, 4, 5, '2026-04-07 09:00', '2026-04-07 10:00', N'Toplantı', N'Haftalık ekip toplantısı', '2026-03-31', 1),
(204, 4, 7, '2026-04-10 14:00', '2026-04-10 15:30', N'Hasta', N'Diş randevusu', '2026-04-08', 1);

SET IDENTITY_INSERT StaffUnavailabilities OFF;
GO

-- ============================================================
-- 17: EK PERSONEL İZİNLERİ (+7, mevcut 1)
-- ============================================================
SET IDENTITY_INSERT StaffLeaves ON;

INSERT INTO StaffLeaves (Id, TenantId, StaffId, StartDate, EndDate, LeaveType, Reason, Status, ApprovedById, ApprovedDate, CDate, IsActive)
VALUES
(200, 4, 5, '2026-04-10', '2026-04-14', N'Annual', N'Bayram tatili', N'Approved', 4, '2026-03-20', '2026-03-15', 1),
(201, 4, 7, '2026-03-28', '2026-03-28', N'Sick', N'Grip', N'Approved', 4, '2026-03-28', '2026-03-28', 1),
(202, 4, 8, '2026-04-21', '2026-04-25', N'Annual', N'Yıllık izin', N'Pending', NULL, NULL, '2026-03-25', 1),
(203, 4, 5, '2026-05-01', '2026-05-02', N'Annual', N'1 Mayıs + köprü', N'Approved', 4, '2026-03-30', '2026-03-28', 1),
(204, 4, 7, '2026-05-19', '2026-05-23', N'Annual', N'Tatil', N'Approved', 4, '2026-03-31', '2026-03-29', 1),
(205, 4, 8, '2026-03-10', '2026-03-10', N'Sick', N'Diş ağrısı', N'Approved', 4, '2026-03-10', '2026-03-10', 1),
(206, 4, 5, '2026-06-15', '2026-06-20', N'Unpaid', N'Kişisel nedenler', N'Pending', NULL, NULL, '2026-03-31', 1);

SET IDENTITY_INSERT StaffLeaves OFF;
GO

-- ============================================================
-- 18: MÜŞTERİ BORÇLARI (9 adet)
-- ============================================================
SET IDENTITY_INSERT CustomerDebts ON;

INSERT INTO CustomerDebts (Id, TenantId, CustomerId, PersonName, Type, Amount, PaidAmount, Currency,
    Description, Notes, DueDate, Status, Source, CDate, IsActive)
VALUES
-- Alacaklar
(200, 4, 200, NULL, N'Receivable', 2400.00, 0, N'TRY', N'Ağda paketi kalan borç', NULL, '2026-05-01', N'Pending', N'PackageSale', '2026-02-01', 1),
(201, 4, 203, NULL, N'Receivable', 400.00, 0, N'TRY', N'Saç kesim ücreti - sonra ödeyecek', N'Bir sonraki gelişinde', '2026-04-15', N'Pending', N'Appointment', '2026-03-20', 1),
(202, 4, NULL, N'Ayça Hanım (dış müşteri)', N'Receivable', 1500.00, 600.00, N'TRY', N'Gelin başı yapıldı, bakiye kaldı', NULL, '2026-04-05', N'PartiallyPaid', N'Manual', '2026-03-15', 1),
(203, 4, 201, NULL, N'Receivable', 6400.00, 3200.00, N'TRY', N'Keratin paketi taksit bakiyesi', N'2 taksit kaldı', '2026-06-20', N'PartiallyPaid', N'PackageSale', '2026-03-20', 1),
-- Borçlar (dışarıya)
(204, 4, NULL, N'Kozmetik Center Ltd.', N'Debt', 8000.00, 3000.00, N'TRY', N'Mart ürün fatura borcu', N'30 gün vadeli', '2026-04-20', N'PartiallyPaid', N'Manual', '2026-03-05', 1),
(205, 4, NULL, N'Nişantaşı Emlak', N'Debt', 18000.00, 18000.00, N'TRY', N'Mart kirası ödendi', NULL, '2026-03-01', N'Paid', N'Manual', '2026-03-01', 1),
-- Vadesi geçmiş
(206, 4, 205, NULL, N'Receivable', 250.00, 0, N'TRY', N'Manikür ücreti - NoShow', N'Gelmedi, 2 kez arandı', '2026-03-20', N'Overdue', N'Appointment', '2026-03-15', 1),
(207, 4, 3, NULL, N'Receivable', 560.00, 0, N'TRY', N'Jel tırnak ücreti', N'Hande - sonra ödeyecek dedi', '2026-03-25', N'Overdue', N'Appointment', '2026-03-10', 1),
-- Ödendi
(208, 4, 2, NULL, N'Receivable', 500.00, 500.00, N'TRY', N'Eski bakiye - tahsil edildi', NULL, '2026-03-15', N'Paid', N'Manual', '2026-02-20', 1);

SET IDENTITY_INSERT CustomerDebts OFF;
GO

-- ============================================================
-- 19: BORÇ ÖDEMELERİ
-- ============================================================
SET IDENTITY_INSERT CustomerDebtPayments ON;

INSERT INTO CustomerDebtPayments (Id, TenantId, CustomerDebtId, Amount, PaymentMethod, Notes, PaymentDate, CDate, IsActive)
VALUES
(200, 4, 202, 600.00, N'BankTransfer', N'Havale ile ödendi', '2026-03-22', '2026-03-22', 1),
(201, 4, 203, 3200.00, N'Cash', N'1. taksit nakit', '2026-03-20', '2026-03-20', 1),
(202, 4, 204, 3000.00, N'BankTransfer', N'Kısmi ödeme', '2026-03-15', '2026-03-15', 1),
(203, 4, 205, 18000.00, N'BankTransfer', N'Kira ödemesi', '2026-03-01', '2026-03-01', 1),
(204, 4, 208, 500.00, N'Cash', N'Nakit tahsil edildi', '2026-03-15', '2026-03-15', 1);

SET IDENTITY_INSERT CustomerDebtPayments OFF;
GO

-- ============================================================
-- 20: UYGULAMA İÇİ BİLDİRİMLER (10 adet)
-- ============================================================
SET IDENTITY_INSERT InAppNotifications ON;

INSERT INTO InAppNotifications (Id, TenantId, UserId, Title, Message, Type, EntityType, EntityId,
    IsRead, ReadAt, ActionUrl, DeduplicationKey, CDate, IsActive)
VALUES
(200, 4, 4, N'Yeni randevu', N'Selin Demir bugün 11:00 için jel tırnak randevusu aldı', N'info', N'Appointment', 203, 0, NULL, N'/appointments', N'APPOINTMENT_NEW_203_20260329', '2026-03-29', 1),
(201, 4, 8, N'Randevu hatırlatma', N'Bugün 11:00 - Selin Demir - Jel Tırnak', N'info', N'Appointment', 203, 1, '2026-03-31 08:00', N'/appointments', N'APPOINTMENT_REMIND_203_20260331', '2026-03-31', 1),
(202, 4, 4, N'İzin talebi', N'Özge Durgut 21-25 Nisan yıllık izin talep etti', N'warning', N'StaffLeave', 202, 0, NULL, N'/staff/leaves', N'LEAVE_NEW_202_20260325', '2026-03-25', 1),
(203, 4, NULL, N'Stok uyarısı', N'La Roche-Posay Effaclar - stok 10 adete düştü', N'warning', N'Product', 204, 0, NULL, N'/products', N'STOCK_LOW_204_20260325', '2026-03-25', 1),
(204, 4, 4, N'Borç hatırlatma', N'Gamze Kılıç - 250 TL manikür borcu vadesi geçmiş!', N'error', N'CustomerDebt', 206, 0, NULL, N'/debts', N'DEBT_OVERDUE_206_20260321', '2026-03-21', 1),
(205, 4, 4, N'Paket tamamlandı', N'Nur Şahin - 4 seans cilt bakım paketi tamamlandı', N'success', N'PackageSale', 205, 1, '2025-11-02 09:00', N'/packages', N'PACKAGE_DONE_205_20251101', '2025-11-01', 1),
(206, 4, 4, N'NoShow uyarısı', N'Gamze Kılıç randevuya gelmedi (15 Mart)', N'warning', N'Appointment', 207, 1, '2026-03-15 12:00', N'/appointments', N'APPOINTMENT_NOSHOW_207_20260315', '2026-03-15', 1),
(207, 4, 4, N'Komisyon raporu', N'Mart ayı komisyon özeti: toplam 1,026 TL ödendi', N'info', NULL, NULL, 0, NULL, N'/reports/commissions', N'COMMISSION_REPORT_202603_T4', '2026-03-31', 1),
(208, 4, 5, N'Randevu onayı', N'Elif Yıldırım - 3 Nisan 10:00 balyaj randevusu onaylandı', N'success', N'Appointment', 205, 0, NULL, N'/appointments', N'APPOINTMENT_CONFIRM_205_20260331', '2026-03-31', 1),
(209, 4, 4, N'Yeni taksit alındı', N'Zehra Aksoy - Keratin paketi 1. taksit: 3,200 TL', N'success', N'PackageSale', 209, 1, '2026-03-20 17:00', N'/packages', N'PACKAGE_PAY_209_20260320', '2026-03-20', 1);

SET IDENTITY_INSERT InAppNotifications OFF;
GO

-- ============================================================
-- 21: EK BİLDİRİM TERCİHLERİ (mevcut: sadece tenant kuralları var)
-- ============================================================
SET IDENTITY_INSERT UserNotificationPreferences ON;

INSERT INTO UserNotificationPreferences (Id, AppUserId, Channel, IsEnabled, CDate, IsActive)
VALUES
-- Mehmet (4): hepsi açık
(200, 4, 1, 1, '2025-06-01', 1),  -- SMS
(201, 4, 2, 1, '2025-06-01', 1),  -- Email
(202, 4, 3, 1, '2025-06-01', 1),  -- Push
-- Ahmet (5): SMS kapalı
(203, 5, 1, 0, '2025-06-15', 1),
(204, 5, 2, 1, '2025-06-15', 1),
(205, 5, 3, 1, '2025-06-15', 1),
-- Gökhan (7)
(206, 7, 1, 1, '2025-07-01', 1),
(207, 7, 2, 1, '2025-07-01', 1),
(208, 7, 3, 1, '2025-07-01', 1),
-- Özge (8)
(209, 8, 2, 1, '2025-08-01', 1),
(210, 8, 3, 1, '2025-08-01', 1);

SET IDENTITY_INSERT UserNotificationPreferences OFF;
GO

-- ============================================================
-- 22: TENANT ÖDEME GEÇMİŞİ (Abonelik ödemeleri)
-- ============================================================
SET IDENTITY_INSERT TenantPaymentHistories ON;

INSERT INTO TenantPaymentHistories (Id, TenantId, SubscriptionId, Amount, PaymentDate, PaymentStatus,
    PaymentMethod, Description, TransactionId, IsRefunded, CDate, IsActive)
VALUES
(200, 4, 5, 1000.00, '2025-10-01', N'Success', N'CreditCard', N'Gold Paketi - İlk ödeme', N'TXN-GW-04-001', 0, '2025-10-01', 1),
(201, 4, 5, 1000.00, '2025-11-01', N'Success', N'CreditCard', N'Gold Paketi - Aylık', N'TXN-GW-04-002', 0, '2025-11-01', 1),
(202, 4, 5, 1000.00, '2025-12-01', N'Success', N'CreditCard', N'Gold Paketi - Aylık', N'TXN-GW-04-003', 0, '2025-12-01', 1),
(203, 4, 5, 1000.00, '2026-01-01', N'Failed', N'CreditCard', N'Gold Paketi - Kart limiti', N'TXN-GW-04-004', 0, '2026-01-01', 1),
(204, 4, 5, 1000.00, '2026-01-03', N'Success', N'CreditCard', N'Gold Paketi - Tekrar deneme', N'TXN-GW-04-005', 0, '2026-01-03', 1),
(205, 4, 5, 1000.00, '2026-02-01', N'Success', N'CreditCard', N'Gold Paketi - Aylık', N'TXN-GW-04-006', 0, '2026-02-01', 1),
(206, 4, 5, 1000.00, '2026-03-01', N'Success', N'CreditCard', N'Gold Paketi - Aylık', N'TXN-GW-04-007', 0, '2026-03-01', 1);

SET IDENTITY_INSERT TenantPaymentHistories OFF;
GO

PRINT N'Glow Atelier (Tenant 4) icin tum test verileri basariyla eklendi!';
GO
