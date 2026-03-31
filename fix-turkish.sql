SET QUOTED_IDENTIFIER ON;
USE BeautyWise;

-- ============================================================
-- CUSTOMERS - Name + Surname fixes
-- ============================================================
-- Tenant 100
UPDATE Customers SET Name = N'Şeyma', Surname = N'Aydın' WHERE Id = 100;
UPDATE Customers SET Surname = N'Yalçın' WHERE Id = 101;
UPDATE Customers SET Name = N'İrem', Surname = N'Başaran' WHERE Id = 103;
UPDATE Customers SET Surname = N'Erçel' WHERE Id = 104;
UPDATE Customers SET Surname = N'Koç' WHERE Id = 105;
UPDATE Customers SET Surname = N'Türkmen' WHERE Id = 106;
UPDATE Customers SET Surname = N'Güneş' WHERE Id = 107;
UPDATE Customers SET Surname = N'Sönmez' WHERE Id = 108;
UPDATE Customers SET Name = N'Pınar', Surname = N'Aktaş' WHERE Id = 109;
-- Tenant 101
UPDATE Customers SET Surname = N'Atagül' WHERE Id = 111;
UPDATE Customers SET Name = N'Bergüzar' WHERE Id = 113;
UPDATE Customers SET Surname = N'Büyüküstün' WHERE Id = 115;
UPDATE Customers SET Name = N'Aslı' WHERE Id = 117;
UPDATE Customers SET Name = N'Songül', Surname = N'Öden' WHERE Id = 118;
UPDATE Customers SET Surname = N'Özdemir' WHERE Id = 119;
-- Tenant 4
UPDATE Customers SET Surname = N'Yıldırım' WHERE Id = 200;
UPDATE Customers SET Name = N'Büşra', Surname = N'Çelik' WHERE Id = 203;
UPDATE Customers SET Surname = N'Şahin' WHERE Id = 204;
UPDATE Customers SET Surname = N'Kılıç' WHERE Id = 205;
UPDATE Customers SET Surname = N'Öztürk' WHERE Id = 206;

-- Also fix Notes/Allergies/Tags with Turkish chars
UPDATE Customers SET Notes = N'Düzenli müşteri, her ay gelir', Tags = N'["VIP","Düzenli"]' WHERE Id = 100;
UPDATE Customers SET Notes = N'Saç boyası alerjisi var - dikkat!', Allergies = N'Amonyak bazlı boyalar', Tags = N'["Düzenli"]', ReferralSource = N'Arkadaş tavsiyesi' WHERE Id = 101;
UPDATE Customers SET Notes = N'Sadece hafta sonları gelebiliyor' WHERE Id = 102;
UPDATE Customers SET Tags = N'["VIP","Düzenli","Öğrenci"]' WHERE Id = 103;
UPDATE Customers SET Notes = N'Cilt bakımına özel ilgi' WHERE Id = 104;
UPDATE Customers SET Notes = N'Paket satış müşterisi' WHERE Id = 105;
UPDATE Customers SET Notes = N'Her 6 haftada bir saç boyası', ReferralSource = N'Arkadaş tavsiyesi', Tags = N'["Düzenli","Boya"]' WHERE Id = 107;
UPDATE Customers SET Notes = N'Gelinlik saçı için geldi' WHERE Id = 108;
UPDATE Customers SET Tags = N'["Düzenli"]' WHERE Id = 109;
UPDATE Customers SET Notes = N'Premium müşteri - özel ilgi' WHERE Id = 110;
UPDATE Customers SET Tags = N'["Düzenli"]' WHERE Id = 111;
UPDATE Customers SET Notes = N'Keratin bakım düzenli', Allergies = N'Lateks alerjisi', Tags = N'["VIP","Düzenli"]' WHERE Id = 112;
UPDATE Customers SET ReferralSource = N'Arkadaş tavsiyesi' WHERE Id = 113;
UPDATE Customers SET Notes = N'Tırnak bakımı ve nail art seviyor', Tags = N'["Tırnak","Düzenli"]' WHERE Id = 114;
UPDATE Customers SET Notes = N'Saç bakım uzmanı tercihi var', Tags = N'["VIP","Düzenli","Saç bakım"]' WHERE Id = 116;
UPDATE Customers SET Notes = N'Anti-aging cilt bakım paketi', Tags = N'["VIP","Paket","Cilt bakım"]' WHERE Id = 118;
-- Tenant 4 customers
UPDATE Customers SET Notes = N'Her ay düzenli saç bakımı', Tags = N'["VIP","Düzenli"]' WHERE Id = 200;
UPDATE Customers SET Notes = N'Hassas cilt - dikkat', Allergies = N'Paraben içeren ürünler', Tags = N'["Düzenli","Hassas cilt"]' WHERE Id = 201;
UPDATE Customers SET Notes = N'Gelin adayı - paket bakım', Tags = N'["VIP","Gelin","Paket"]', ReferralSource = N'Arkadaş tavsiyesi' WHERE Id = 202;
UPDATE Customers SET Notes = N'Anti-aging cilt bakımı düzenli', Tags = N'["VIP","Premium","Cilt bakım"]' WHERE Id = 204;
UPDATE Customers SET Notes = N'Sadece hafta sonları' WHERE Id = 205;
UPDATE Customers SET Notes = N'Keratin bakım müdavimi', Allergies = N'Formaldehit bazlı ürünler', Tags = N'["VIP","Düzenli","Keratin"]' WHERE Id = 206;

-- ============================================================
-- TREATMENTS - Name + Description
-- ============================================================
UPDATE Treatments SET Name = N'Saç Kesimi (Kadın)', Description = N'Yıkama, kesim ve fön dahil' WHERE Id = 100;
UPDATE Treatments SET Name = N'Saç Boyama', Description = N'Tek renk saç boyama işlemi' WHERE Id = 101;
UPDATE Treatments SET Name = N'Röfle / Balyaj', Description = N'Modern röfle ve balyaj teknikleri' WHERE Id = 102;
UPDATE Treatments SET Name = N'Fön', Description = N'Yıkama ve fön' WHERE Id = 103;
UPDATE Treatments SET Name = N'Keratin Bakım', Description = N'Brezilya keratin saç bakımı' WHERE Id = 104;
UPDATE Treatments SET Name = N'Manikür', Description = N'Klasik manikür uygulaması' WHERE Id = 105;
UPDATE Treatments SET Name = N'Pedikür', Description = N'Klasik pedikür uygulaması' WHERE Id = 106;
UPDATE Treatments SET Name = N'Cilt Bakımı', Description = N'Derin cilt temizliği ve bakım' WHERE Id = 107;
UPDATE Treatments SET Name = N'Kaş Dizaynı', Description = N'Kaş şekillendirme ve alma' WHERE Id = 108;
UPDATE Treatments SET Name = N'Ağda (Tüm Vücut)', Description = N'Tam vücut ağda uygulaması' WHERE Id = 109;
UPDATE Treatments SET Name = N'Saç Kesimi (Kadın)', Description = N'Premium saç kesimi, yıkama ve styling' WHERE Id = 110;
UPDATE Treatments SET Name = N'Saç Boyama', Description = N'Profesyonel saç boyama' WHERE Id = 111;
UPDATE Treatments SET Name = N'Ombre / Sombre', Description = N'Ombre ve sombre renklendirme' WHERE Id = 112;
UPDATE Treatments SET Name = N'Saç Kesimi (Erkek)', Description = N'Erkek saç kesimi ve şekillendirme' WHERE Id = 113;
UPDATE Treatments SET Name = N'Sakal Tıraşı', Description = N'Klasik ustura tıraşı' WHERE Id = 114;
UPDATE Treatments SET Name = N'Keratin Bakım', Description = N'Premium keratin düzleştirme' WHERE Id = 115;
UPDATE Treatments SET Name = N'Nail Art', Description = N'Özel tırnak tasarımı' WHERE Id = 116;
UPDATE Treatments SET Name = N'Cilt Bakımı (Premium)', Description = N'HydraFacial ve anti-aging bakım' WHERE Id = 117;
UPDATE Treatments SET Name = N'Lazer Epilasyon', Description = N'Diode lazer epilasyon seansı' WHERE Id = 118;
UPDATE Treatments SET Name = N'Micropigmentation', Description = N'Kalıcı kaş kontürü' WHERE Id = 119;
UPDATE Treatments SET Name = N'Saç Kesimi (Kadın)', Description = N'Yıkama, kesim ve fön dahil' WHERE Id = 200;
UPDATE Treatments SET Name = N'Röfle / Balyaj', Description = N'Modern röfle ve balyaj teknikleri' WHERE Id = 201;
UPDATE Treatments SET Name = N'Keratin Bakım', Description = N'Brezilya keratin saç bakımı' WHERE Id = 202;
UPDATE Treatments SET Name = N'Fön', Description = N'Yıkama ve fön' WHERE Id = 203;
UPDATE Treatments SET Name = N'Cilt Bakımı', Description = N'Derin cilt temizliği ve bakım' WHERE Id = 204;
UPDATE Treatments SET Name = N'Manikür', Description = N'Klasik manikür uygulaması' WHERE Id = 205;
UPDATE Treatments SET Name = N'Kaş Dizaynı', Description = N'Kaş şekillendirme ve alma' WHERE Id = 206;
UPDATE Treatments SET Name = N'Ağda (Tüm Vücut)', Description = N'Tam vücut ağda uygulaması' WHERE Id = 207;

-- ============================================================
-- PRODUCTS - Name + Description
-- ============================================================
UPDATE Products SET Name = N'L''Oréal Elvive Şampuan 400ml', Description = N'Hasar görmüş saçlar için onarıcı şampuan' WHERE Id = 100;
UPDATE Products SET Name = N'Schwarzkopf BC Bonacure Saç Maskesi', Description = N'Yoğun nemlendirici maske 200ml' WHERE Id = 101;
UPDATE Products SET Name = N'Wella Professionals Saç Spreyi', Description = N'Güçlü tutuş saç spreyi 300ml' WHERE Id = 102;
UPDATE Products SET Name = N'Moroccanoil Saç Bakım Yağı 100ml', Description = N'Argan yağı bazlı saç bakım' WHERE Id = 104;
UPDATE Products SET Name = N'Kérastase Nutritive Şampuan 250ml', Description = N'Kuru saçlar için besleyici şampuan' WHERE Id = 105;
UPDATE Products SET Name = N'Olaplex No.3 Hair Perfector', Description = N'Ev bakımı için bağ onarıcı' WHERE Id = 106;
UPDATE Products SET Name = N'GHD Isı Koruyucu Sprey', Description = N'Saçı ısıdan koruyan sprey 120ml' WHERE Id = 107;
UPDATE Products SET Name = N'Essie Gel Couture Oje', Description = N'Uzun ömürlü gel oje - Ballet Nudes' WHERE Id = 108;
UPDATE Products SET Name = N'La Roche-Posay Effaclar Duo+', Description = N'Akne bakım kremi 40ml' WHERE Id = 109;
UPDATE Products SET Name = N'Kérastase Nutritive Şampuan 250ml', Description = N'Kuru saçlar için besleyici şampuan' WHERE Id = 200;
UPDATE Products SET Name = N'Olaplex No.3 Hair Perfector', Description = N'Ev bakımı için bağ onarıcı' WHERE Id = 201;
UPDATE Products SET Name = N'Moroccanoil Saç Bakım Yağı 100ml', Description = N'Argan yağı bazlı saç bakım' WHERE Id = 202;
UPDATE Products SET Name = N'GHD Isı Koruyucu Sprey 120ml', Description = N'Saçı ısıdan koruyan sprey' WHERE Id = 205;
UPDATE Products SET Name = N'Wella Professionals Saç Spreyi 300ml', Description = N'Güçlü tutuş sprey' WHERE Id = 206;
UPDATE Products SET Name = N'Schwarzkopf BC Saç Maskesi 200ml', Description = N'Yoğun nemlendirici maske' WHERE Id = 207;

-- ============================================================
-- USERS - Name + Surname (only fake ones, Id >= 100)
-- ============================================================
UPDATE Users SET Name = N'Ayşe', Surname = N'Yılmaz' WHERE Id = 100;
UPDATE Users SET Surname = N'Öztürk' WHERE Id = 103;
UPDATE Users SET Surname = N'Çelik' WHERE Id = 105;
UPDATE Users SET Name = N'Burak', Surname = N'Şahin' WHERE Id = 107;
UPDATE Users SET Surname = N'Yıldız' WHERE Id = 108;

-- ============================================================
-- TENANTS - CompanyName
-- ============================================================
UPDATE Tenants SET CompanyName = N'Güzellik Dünyası' WHERE Id = 100;

-- ============================================================
-- BRANCHES - Name + Address
-- ============================================================
UPDATE Branches SET Name = N'Kadıköy Merkez Şube', Address = N'Bağdat Cad. No:125 Kadıköy/İstanbul' WHERE Id = 100;
UPDATE Branches SET Name = N'Ataşehir Şube', Address = N'Atatürk Mah. Ersan Cad. No:8 Ataşehir/İstanbul' WHERE Id = 101;
UPDATE Branches SET Name = N'Beşiktaş Merkez', Address = N'Nispetiye Cad. No:42 Beşiktaş/İstanbul' WHERE Id = 102;
UPDATE Branches SET Name = N'Merkez Şube', Address = N'Nişantaşı Abdi İpekçi Cad. No:15 Şişli/İstanbul' WHERE Id = 200;

-- ============================================================
-- EXPENSE CATEGORIES
-- ============================================================
UPDATE ExpenseCategories SET Name = N'Malzeme/Ürün Alımı' WHERE Id = 101;
UPDATE ExpenseCategories SET Name = N'Personel Maaşı' WHERE Id = 102;
UPDATE ExpenseCategories SET Name = N'Fatura (Elektrik/Su/Doğalgaz)' WHERE Id = 103;
UPDATE ExpenseCategories SET Name = N'Ürün Stok' WHERE Id = 106;
UPDATE ExpenseCategories SET Name = N'Bakım/Onarım' WHERE Id = 109;
UPDATE ExpenseCategories SET Name = N'Malzeme/Ürün Alımı' WHERE Id = 201;
UPDATE ExpenseCategories SET Name = N'Personel Maaşı' WHERE Id = 202;
UPDATE ExpenseCategories SET Name = N'Elektrik Faturası' WHERE Id = 203;
UPDATE ExpenseCategories SET Name = N'Su Faturası' WHERE Id = 204;
UPDATE ExpenseCategories SET Name = N'Doğalgaz Faturası' WHERE Id = 205;
UPDATE ExpenseCategories SET Name = N'Bakım/Onarım' WHERE Id = 207;
UPDATE ExpenseCategories SET Name = N'Diğer' WHERE Id = 209;

-- ============================================================
-- EXPENSES - Description + Notes
-- ============================================================
UPDATE Expenses SET Description = N'Mart 2026 Kadıköy kira' WHERE Id = 100;
UPDATE Expenses SET Description = N'Ürün siparişi', Notes = N'30 adet şampuan + 15 maske' WHERE Id = 101;
UPDATE Expenses SET Description = N'Mart elektrik faturası' WHERE Id = 102;
UPDATE Expenses SET Description = N'Mart su faturası' WHERE Id = 103;
UPDATE Expenses SET Description = N'Mart 2026 Ataşehir kira' WHERE Id = 105;
UPDATE Expenses SET Description = N'Mart 2026 Beşiktaş kira' WHERE Id = 106;
UPDATE Expenses SET Description = N'Toptan ürün siparişi' WHERE Id = 107;
UPDATE Expenses SET Description = N'Mart elektrik + su + doğalgaz' WHERE Id = 109;
UPDATE Expenses SET Description = N'Mart 2026 dükkan kirası' WHERE Id = 200;
UPDATE Expenses SET Description = N'Kérastase + Olaplex toptan sipariş', Notes = N'Aylık stok yenilemesi' WHERE Id = 201;
UPDATE Expenses SET Description = N'Mart elektrik faturası' WHERE Id = 202;
UPDATE Expenses SET Description = N'Mart su faturası' WHERE Id = 203;
UPDATE Expenses SET Description = N'Mart doğalgaz faturası' WHERE Id = 204;
UPDATE Expenses SET Description = N'Instagram + TikTok reklam - Mart', Notes = N'Story + Reels reklam kampanyası' WHERE Id = 205;
UPDATE Expenses SET Description = N'Ahmet - Mart maaşı' WHERE Id = 206;
UPDATE Expenses SET Description = N'Özge - Mart maaşı' WHERE Id = 207;
UPDATE Expenses SET Description = N'Klima bakım ve onarım', Notes = N'Yıllık bakım + gaz dolumu' WHERE Id = 208;
UPDATE Expenses SET Description = N'Olaplex import order', Notes = N'USD ile ödendi' WHERE Id = 209;

-- ============================================================
-- APPOINTMENTS - Notes
-- ============================================================
UPDATE Appointments SET Notes = N'Katmanlı kesim istedi' WHERE Id = 100;
UPDATE Appointments SET Notes = N'Amonyaksız boya kullanıldı' WHERE Id = 101;
UPDATE Appointments SET Notes = N'Balyaj - karamel tonları' WHERE Id = 102;
UPDATE Appointments SET Notes = N'Kızıl bakır tonları' WHERE Id = 104;
UPDATE Appointments SET Notes = N'Düğün hazırlığı' WHERE Id = 105;
UPDATE Appointments SET Notes = N'French manikür' WHERE Id = 107;
UPDATE Appointments SET Notes = N'Gelin hazırlığı öncesi' WHERE Id = 109;
UPDATE Appointments SET Notes = N'Müşteri hastalandı' WHERE Id = 110;
UPDATE Appointments SET Notes = N'Premium kesim + bakım' WHERE Id = 111;
UPDATE Appointments SET Notes = N'Koyu kahve tonları' WHERE Id = 113;
UPDATE Appointments SET Notes = N'Gel nail art - çiçek deseni' WHERE Id = 114;
UPDATE Appointments SET Notes = N'Aylık anti-aging bakım' WHERE Id = 115;
UPDATE Appointments SET Notes = N'Sombre geçiş istiyor' WHERE Id = 117;
UPDATE Appointments SET Notes = N'İlk seans' WHERE Id = 118;
UPDATE Appointments SET Notes = N'Müşteri gelmedi, aranacak' WHERE Id = 119;
UPDATE Appointments SET Notes = N'Katmanlı kesim' WHERE Id = 200;
UPDATE Appointments SET Notes = N'Anti-aging cilt bakımı' WHERE Id = 201;
UPDATE Appointments SET Notes = N'Keratin bakım seansı' WHERE Id = 202;
UPDATE Appointments SET Notes = N'Gelin jel tırnak denemesi' WHERE Id = 203;
UPDATE Appointments SET Notes = N'Hassas cilt bakımı' WHERE Id = 204;
UPDATE Appointments SET Notes = N'Balyaj - bal tonları' WHERE Id = 205;
UPDATE Appointments SET Notes = N'Müşteri iptal etti' WHERE Id = 206;
UPDATE Appointments SET Notes = N'Gelmedi, aranacak' WHERE Id = 207;

-- ============================================================
-- APPOINTMENT PAYMENTS - Notes
-- ============================================================
UPDATE AppointmentPayments SET Notes = N'Kredi kartı ile' WHERE Id = 101;
UPDATE AppointmentPayments SET Notes = N'Nakit ödendi' WHERE Id = 103;
UPDATE AppointmentPayments SET Notes = N'Visa ile ödendi' WHERE Id = 106;
UPDATE AppointmentPayments SET Notes = N'Nakit ödendi' WHERE Id = 200;
UPDATE AppointmentPayments SET Notes = N'Kredi kartı' WHERE Id = 201;
UPDATE AppointmentPayments SET Notes = N'Visa ile' WHERE Id = 202;
UPDATE AppointmentPayments SET Notes = N'USD bahşiş' WHERE Id = 203;
UPDATE AppointmentPayments SET Notes = N'Kart ile ödendi' WHERE Id = 204;

-- ============================================================
-- PRODUCT SALES - Notes
-- ============================================================
UPDATE ProductSales SET Notes = N'Randevu sonrası satış' WHERE Id = 100;
UPDATE ProductSales SET Notes = N'2 adet aldı' WHERE Id = 102;
UPDATE ProductSales SET Notes = N'3 farklı renk' WHERE Id = 103;
UPDATE ProductSales SET Notes = N'Kayıtsız müşteri' WHERE Id = 104;
UPDATE ProductSales SET Notes = N'Keratin sonrası ev bakımı' WHERE Id = 106;
UPDATE ProductSales SET Notes = N'Cilt bakım sonrası tavsiye' WHERE Id = 108;
UPDATE ProductSales SET Notes = N'Saç kesimi sonrası' WHERE Id = 200;
UPDATE ProductSales SET Notes = N'Keratin sonrası ev bakımı' WHERE Id = 201;
UPDATE ProductSales SET Notes = N'Cilt bakım sonrası' WHERE Id = 202;
UPDATE ProductSales SET Notes = N'2 farklı renk oje' WHERE Id = 203;
UPDATE ProductSales SET Notes = N'3 adet şampuan' WHERE Id = 204;
UPDATE ProductSales SET Notes = N'Fön öncesi sprey' WHERE Id = 206;
UPDATE ProductSales SET Notes = N'2 adet maske' WHERE Id = 207;
UPDATE ProductSales SET Notes = N'Kayıtsız müşteri' WHERE Id = 208;
UPDATE ProductSales SET Notes = N'Anti-aging bakım ürünü' WHERE Id = 209;

-- ============================================================
-- PACKAGE SALES - Notes
-- ============================================================
UPDATE PackageSales_Packages SET Notes = N'6 seans keratin paketi' WHERE Id = 100;
UPDATE PackageSales_Packages SET Notes = N'10 seans cilt bakım paketi' WHERE Id = 101;
UPDATE PackageSales_Packages SET Notes = N'4 seans boya paketi - tamamlandı' WHERE Id = 102;
UPDATE PackageSales_Packages SET Notes = N'8 seans ağda paketi - taksitli' WHERE Id = 103;
UPDATE PackageSales_Packages SET Notes = N'12 seans anti-aging paketi' WHERE Id = 104;
UPDATE PackageSales_Packages SET Notes = N'4 seans keratin paketi' WHERE Id = 105;
UPDATE PackageSales_Packages SET Notes = N'6 seans boya + bakım paketi' WHERE Id = 106;
UPDATE PackageSales_Packages SET Notes = N'10 seans nail art paketi' WHERE Id = 107;
UPDATE PackageSales_Packages SET Notes = N'8 seans lazer epilasyon - bitti' WHERE Id = 108;
UPDATE PackageSales_Packages SET Notes = N'3 seans kesim paketi - taksit' WHERE Id = 109;
UPDATE PackageSales_Packages SET Notes = N'6 seans keratin paketi' WHERE Id = 200;
UPDATE PackageSales_Packages SET Notes = N'10 seans cilt bakım paketi' WHERE Id = 201;
UPDATE PackageSales_Packages SET Notes = N'8 seans jel tırnak paketi - gelin' WHERE Id = 202;
UPDATE PackageSales_Packages SET Notes = N'8 seans ağda paketi - taksitli' WHERE Id = 203;
UPDATE PackageSales_Packages SET Notes = N'6 seans boya paketi - Ayşe' WHERE Id = 204;
UPDATE PackageSales_Packages SET Notes = N'4 seans cilt bakım - tamamlandı' WHERE Id = 205;
UPDATE PackageSales_Packages SET Notes = N'3 seans saç kesim - bitti' WHERE Id = 206;
UPDATE PackageSales_Packages SET Notes = N'6 seans manikür - süre doldu' WHERE Id = 207;
UPDATE PackageSales_Packages SET Notes = N'İptal - müşteri taşındı' WHERE Id = 208;
UPDATE PackageSales_Packages SET Notes = N'4 seans keratin - 3 taksit' WHERE Id = 209;

-- ============================================================
-- PACKAGE USAGES - Notes
-- ============================================================
UPDATE PackageSales_Usages SET Notes = N'1. seans tamamlandı' WHERE Id = 100;
UPDATE PackageSales_Usages SET Notes = N'2. seans tamamlandı' WHERE Id = 101;
UPDATE PackageSales_Usages SET Notes = N'3. seans tamamlandı' WHERE Id = 102;
UPDATE PackageSales_Usages SET Notes = N'Son seans çok başarılı' WHERE Id = 109;
UPDATE PackageSales_Usages SET Notes = N'Anti-aging serum eklendi' WHERE Id = 209;

-- ============================================================
-- PACKAGE PAYMENTS - Notes
-- ============================================================
UPDATE PackageSales_Payments SET Notes = N'Peşinat' WHERE Id = 102;
UPDATE PackageSales_Payments SET Notes = N'Peşinat' WHERE Id = 202;
UPDATE PackageSales_Payments SET Notes = N'1. taksit - kart ile' WHERE Id = 203;

-- ============================================================
-- STAFF HR INFOS
-- ============================================================
UPDATE StaffHRInfos SET Position = N'Kıdemli Kuaför', Notes = N'10 yıl deneyimli' WHERE Id = 100;
UPDATE StaffHRInfos SET Position = N'Kuaför' WHERE Id = 101;
UPDATE StaffHRInfos SET Position = N'Güzellik Uzmanı', Notes = N'Cilt bakım sertifikalı' WHERE Id = 102;
UPDATE StaffHRInfos SET Position = N'Manikür/Pedikür Uzmanı' WHERE Id = 103;
UPDATE StaffHRInfos SET Position = N'Kıdemli Stilist', Notes = N'Uluslararası deneyim' WHERE Id = 104;
UPDATE StaffHRInfos SET Position = N'Saç Bakım Uzmanı', Notes = N'Keratin sertifikalı' WHERE Id = 105;
UPDATE StaffHRInfos SET Position = N'Nail Art Uzmanı' WHERE Id = 106;
UPDATE StaffHRInfos SET Position = N'Cilt Bakım Uzmanı', Notes = N'Anti-aging sertifikalı' WHERE Id = 107;
UPDATE StaffHRInfos SET Position = N'Kıdemli Kuaför', Notes = N'Saç boyama ve keratin uzmanı' WHERE Id = 200;
UPDATE StaffHRInfos SET Position = N'Cilt Bakım Uzmanı', Notes = N'Anti-aging sertifikalı' WHERE Id = 201;
UPDATE StaffHRInfos SET Position = N'Tırnak/Güzellik Uzmanı', Notes = N'Jel tırnak ve nail art uzmanı' WHERE Id = 202;

-- ============================================================
-- STAFF LEAVES
-- ============================================================
UPDATE StaffLeaves SET LeaveType = N'Annual', Reason = N'Bayram tatili' WHERE Id = 100;
UPDATE StaffLeaves SET LeaveType = N'Sick', Reason = N'Grip' WHERE Id = 101;
UPDATE StaffLeaves SET LeaveType = N'Annual', Reason = N'Yıllık izin' WHERE Id = 102;
UPDATE StaffLeaves SET LeaveType = N'Annual', Reason = N'1 Mayıs + köprü' WHERE Id = 103;
UPDATE StaffLeaves SET LeaveType = N'Annual', Reason = N'Aile ziyareti' WHERE Id = 104;
UPDATE StaffLeaves SET LeaveType = N'Sick', Reason = N'Diş problemi' WHERE Id = 105;
UPDATE StaffLeaves SET LeaveType = N'Unpaid', Reason = N'Kişisel nedenler' WHERE Id = 106;
UPDATE StaffLeaves SET Reason = N'Bayram tatili' WHERE Id = 200;
UPDATE StaffLeaves SET Reason = N'Yıllık izin' WHERE Id = 202;
UPDATE StaffLeaves SET Reason = N'1 Mayıs + köprü' WHERE Id = 203;
UPDATE StaffLeaves SET Reason = N'Diş ağrısı' WHERE Id = 205;
UPDATE StaffLeaves SET Reason = N'Kişisel nedenler' WHERE Id = 206;

-- ============================================================
-- STAFF UNAVAILABILITIES
-- ============================================================
UPDATE StaffUnavailabilities SET Reason = N'Öğle Molası', Notes = N'Uzun öğle molası - doktor randevusu' WHERE Id = 100;
UPDATE StaffUnavailabilities SET Reason = N'Toplantı', Notes = N'Ürün tanıtım toplantısı' WHERE Id = 101;
UPDATE StaffUnavailabilities SET Reason = N'İzin', Notes = N'Erken çıkış' WHERE Id = 102;
UPDATE StaffUnavailabilities SET Reason = N'Toplantı', Notes = N'Haftalık ekip toplantısı' WHERE Id = 103;
UPDATE StaffUnavailabilities SET Reason = N'Hasta', Notes = N'Eczaneye gidecek' WHERE Id = 104;
UPDATE StaffUnavailabilities SET Reason = N'Öğle Molası', Notes = N'Doktor randevusu' WHERE Id = 200;
UPDATE StaffUnavailabilities SET Reason = N'Toplantı', Notes = N'Ürün tanıtım toplantısı' WHERE Id = 201;
UPDATE StaffUnavailabilities SET Reason = N'İzin', Notes = N'Erken çıkış - kişisel' WHERE Id = 202;
UPDATE StaffUnavailabilities SET Reason = N'Toplantı', Notes = N'Haftalık ekip toplantısı' WHERE Id = 203;
UPDATE StaffUnavailabilities SET Reason = N'Hasta', Notes = N'Diş randevusu' WHERE Id = 204;

-- ============================================================
-- CUSTOMER DEBTS
-- ============================================================
UPDATE CustomerDebts SET Description = N'Ağda paketi kalan borç' WHERE Id = 100;
UPDATE CustomerDebts SET Description = N'Saç kesim ücreti', Notes = N'Bir sonraki gelişinde alınacak' WHERE Id = 101;
UPDATE CustomerDebts SET PersonName = N'Meryem Hanım (dış müşteri)', Description = N'Gelin başı yapıldı, bakiye kaldı' WHERE Id = 102;
UPDATE CustomerDebts SET PersonName = N'Kozmetik Dünyası Ltd.', Description = N'Mart ayı ürün alımı fatura borcu', Notes = N'15 gün vadeli' WHERE Id = 103;
UPDATE CustomerDebts SET Description = N'Paket peşinat bakiyesi' WHERE Id = 104;
UPDATE CustomerDebts SET Description = N'Cilt bakım ödemesi bekliyor', Notes = N'Havale ile ödeyecek' WHERE Id = 105;
UPDATE CustomerDebts SET PersonName = N'Beauty Supply Co.', Description = N'Nisan ayı stok siparişi' WHERE Id = 106;
UPDATE CustomerDebts SET Description = N'Geçen ayki pedikür ücreti', Notes = N'3 kez arandı, ulaşılamadı' WHERE Id = 107;
UPDATE CustomerDebts SET Description = N'2 seans bakım ücreti', Notes = N'Telefon açmıyor' WHERE Id = 108;
UPDATE CustomerDebts SET Description = N'Ağda paketi kalan borç' WHERE Id = 200;
UPDATE CustomerDebts SET Description = N'Saç kesim ücreti - sonra ödeyecek', Notes = N'Bir sonraki gelişinde' WHERE Id = 201;
UPDATE CustomerDebts SET PersonName = N'Ayça Hanım (dış müşteri)', Description = N'Gelin başı yapıldı, bakiye kaldı' WHERE Id = 202;
UPDATE CustomerDebts SET Description = N'Keratin paketi taksit bakiyesi', Notes = N'2 taksit kaldı' WHERE Id = 203;
UPDATE CustomerDebts SET PersonName = N'Kozmetik Center Ltd.', Description = N'Mart ürün fatura borcu', Notes = N'30 gün vadeli' WHERE Id = 204;
UPDATE CustomerDebts SET PersonName = N'Nişantaşı Emlak', Description = N'Mart kirası ödendi' WHERE Id = 205;
UPDATE CustomerDebts SET Description = N'Manikür ücreti - NoShow', Notes = N'Gelmedi, 2 kez arandı' WHERE Id = 206;
UPDATE CustomerDebts SET Description = N'Jel tırnak ücreti', Notes = N'Hande - sonra ödeyecek dedi' WHERE Id = 207;
UPDATE CustomerDebts SET Description = N'Eski bakiye - tahsil edildi' WHERE Id = 208;

-- ============================================================
-- CUSTOMER DEBT PAYMENTS
-- ============================================================
UPDATE CustomerDebtPayments SET Notes = N'Havale ile ödendi' WHERE Id = 100;
UPDATE CustomerDebtPayments SET Notes = N'İlk taksit havale' WHERE Id = 101;
UPDATE CustomerDebtPayments SET Notes = N'Nakit ödeme' WHERE Id = 102;
UPDATE CustomerDebtPayments SET Notes = N'Havale ile ödendi' WHERE Id = 200;
UPDATE CustomerDebtPayments SET Notes = N'1. taksit nakit' WHERE Id = 201;
UPDATE CustomerDebtPayments SET Notes = N'Kısmi ödeme' WHERE Id = 202;
UPDATE CustomerDebtPayments SET Notes = N'Kira ödemesi' WHERE Id = 203;
UPDATE CustomerDebtPayments SET Notes = N'Nakit tahsil edildi' WHERE Id = 204;

-- ============================================================
-- IN-APP NOTIFICATIONS
-- ============================================================
UPDATE InAppNotifications SET Title = N'Yeni randevu', Message = N'Şeyma Aydın yarın 09:00 için randevu aldı' WHERE Id = 100;
UPDATE InAppNotifications SET Title = N'Randevu hatırlatma', Message = N'Bugün saat 09:00 - Şeyma Aydın - Fön' WHERE Id = 101;
UPDATE InAppNotifications SET Title = N'İzin talebi', Message = N'Zeynep Öztürk 21-25 Nisan arası yıllık izin talep etti' WHERE Id = 102;
UPDATE InAppNotifications SET Title = N'Yeni ürün stokta', Message = N'Moroccanoil yağı stok yenilendi - 12 adet' WHERE Id = 103;
UPDATE InAppNotifications SET Title = N'Borç hatırlatma', Message = N'Canan Polat - 500 TL borç vadesi geçmiş!' WHERE Id = 104;
UPDATE InAppNotifications SET Title = N'Yeni randevu', Message = N'Beren Saat bugün 10:00 için onaylandı' WHERE Id = 105;
UPDATE InAppNotifications SET Title = N'Paket tamamlandı', Message = N'Beren Saat - 8 seans lazer epilasyon paketi tamamlandı' WHERE Id = 106;
UPDATE InAppNotifications SET Title = N'Komisyon raporu', Message = N'Mart ayı komisyon raporu hazır - toplam: 1,405 TL' WHERE Id = 107;
UPDATE InAppNotifications SET Title = N'NoShow uyarısı', Message = N'Tuba Büyüküstün randevuya gelmedi' WHERE Id = 108;
UPDATE InAppNotifications SET Title = N'Vadesi geçen borç', Message = N'Tuba Büyüküstün - 1,600 TL borç vadesi geçmiş' WHERE Id = 109;
UPDATE InAppNotifications SET Title = N'Yeni randevu', Message = N'Selin Demir bugün 11:00 için jel tırnak randevusu aldı' WHERE Id = 200;
UPDATE InAppNotifications SET Title = N'Randevu hatırlatma', Message = N'Bugün 11:00 - Selin Demir - Jel Tırnak' WHERE Id = 201;
UPDATE InAppNotifications SET Title = N'İzin talebi', Message = N'Özge Durgut 21-25 Nisan yıllık izin talep etti' WHERE Id = 202;
UPDATE InAppNotifications SET Title = N'Stok uyarısı', Message = N'La Roche-Posay Effaclar - stok 10 adete düştü' WHERE Id = 203;
UPDATE InAppNotifications SET Title = N'Borç hatırlatma', Message = N'Gamze Kılıç - 250 TL manikür borcu vadesi geçmiş!' WHERE Id = 204;
UPDATE InAppNotifications SET Title = N'Paket tamamlandı', Message = N'Nur Şahin - 4 seans cilt bakım paketi tamamlandı' WHERE Id = 205;
UPDATE InAppNotifications SET Title = N'NoShow uyarısı', Message = N'Gamze Kılıç randevuya gelmedi (15 Mart)' WHERE Id = 206;
UPDATE InAppNotifications SET Title = N'Komisyon raporu', Message = N'Mart ayı komisyon özeti: toplam 1,026 TL ödendi' WHERE Id = 207;
UPDATE InAppNotifications SET Title = N'Randevu onayı', Message = N'Elif Yıldırım - 3 Nisan 10:00 balyaj randevusu onaylandı' WHERE Id = 208;
UPDATE InAppNotifications SET Title = N'Yeni taksit alındı', Message = N'Zehra Aksoy - Keratin paketi 1. taksit: 3,200 TL' WHERE Id = 209;

-- ============================================================
-- TENANT PAYMENT HISTORIES
-- ============================================================
UPDATE TenantPaymentHistories SET Description = N'Gold Paketi - İlk ödeme' WHERE Id = 100;
UPDATE TenantPaymentHistories SET Description = N'Gold Paketi - Aylık' WHERE Id IN (101, 102);
UPDATE TenantPaymentHistories SET Description = N'Gold Paketi - Kart limiti' WHERE Id = 103;
UPDATE TenantPaymentHistories SET Description = N'Gold Paketi - Tekrar deneme' WHERE Id = 104;
UPDATE TenantPaymentHistories SET Description = N'Platinum Paketi - İlk ödeme' WHERE Id = 105;
UPDATE TenantPaymentHistories SET Description = N'Platinum Paketi - Aylık' WHERE Id IN (106, 107, 108);
UPDATE TenantPaymentHistories SET Description = N'Gold Paketi - İlk ödeme' WHERE Id = 200;
UPDATE TenantPaymentHistories SET Description = N'Gold Paketi - Aylık' WHERE Id IN (201, 202, 205, 206);
UPDATE TenantPaymentHistories SET Description = N'Gold Paketi - Kart limiti' WHERE Id = 203;
UPDATE TenantPaymentHistories SET Description = N'Gold Paketi - Tekrar deneme' WHERE Id = 204;

-- ============================================================
-- TENANT INVITE TOKENS
-- ============================================================
UPDATE TenantInviteTokens SET EmailToInvite = N'yeni.personel@gmail.com' WHERE Id = 100;

PRINT N'Tum Turkce karakter bozukluklari duzeltildi!';
