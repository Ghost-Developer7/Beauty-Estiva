/**
 * Seed script — Glow Atelier (TenantId: 4)
 * karamhmt.0793@gmail.com için dummy data
 * Ocak 2026 – Nisan 2026 arası gerçekçi fake veri
 *
 * Çalıştır: DATABASE_URL="sqlserver://217.195.202.150:1433;database=BeautyWise;user=sa;password=Mhmt+2024;trustServerCertificate=true" npx tsx prisma/seed-glow.ts
 */

import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

// ─── Constants ───────────────────────────────────────────────────────────────
const TENANT_ID = 4;
const CURRENCY_ID = 1; // TRY

// Mevcut staff ID'leri (DB'den)
const STAFF = [
  { id: 4, name: "Mehmet Kara", commissionRate: 35 },
  { id: 5, name: "Ahmet Kara", commissionRate: 30 },
  { id: 6, name: "Gökhan Mülayim", commissionRate: 30 },
  { id: 8, name: "Özge Durgut", commissionRate: 32 },
];

// Mevcut treatment ID'leri (DB'den)
const TREATMENTS = [
  { id: 2, name: "Saç Boyama", price: 500, duration: 90 },
  { id: 3, name: "Jel Tırnak", price: 560, duration: 45 },
  { id: 200, name: "Saç Kesimi (Kadın)", price: 400, duration: 60 },
  { id: 201, name: "Röfle / Balyaj", price: 1600, duration: 120 },
  { id: 202, name: "Keratin Bakım", price: 2800, duration: 150 },
  { id: 203, name: "Fön", price: 180, duration: 30 },
  { id: 204, name: "Cilt Bakımı", price: 600, duration: 75 },
  { id: 205, name: "Manikür", price: 250, duration: 45 },
  { id: 206, name: "Kaş Dizaynı", price: 120, duration: 20 },
  { id: 207, name: "Ağda (Tüm Vücut)", price: 700, duration: 90 },
];

// Mevcut gider kategorileri (DB'den)
const EXP_CATS = [
  { id: 200, name: "Kira" },
  { id: 201, name: "Malzeme/Ürün Alımı" },
  { id: 202, name: "Personel Maaşı" },
  { id: 203, name: "Elektrik Faturası" },
  { id: 204, name: "Su Faturası" },
  { id: 205, name: "Doğalgaz Faturası" },
  { id: 206, name: "Reklam/Pazarlama" },
  { id: 207, name: "Bakım/Onarım" },
  { id: 208, name: "Vergi/Sigorta" },
  { id: 209, name: "Diğer" },
];

// Mevcut ürünler (DB'den)
const PRODUCTS = [
  { id: 1, name: "Şampuan", price: 185 },
  { id: 2, name: "Argan Yağı Serumu", price: 320 },
  { id: 200, name: "Kérastase Nutritive Şampuan", price: 450 },
  { id: 201, name: "Olaplex No.3", price: 680 },
  { id: 202, name: "Moroccanoil Bakım Yağı", price: 520 },
  { id: 203, name: "OPI Nail Lacquer", price: 150 },
  { id: 204, name: "La Roche-Posay Effaclar", price: 390 },
  { id: 205, name: "GHD Isı Koruyucu Sprey", price: 280 },
  { id: 206, name: "Wella Saç Spreyi", price: 195 },
  { id: 207, name: "Schwarzkopf Saç Maskesi", price: 240 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function d(y: number, m: number, day: number, h = 9, min = 0): Date {
  return new Date(y, m - 1, day, h, min, 0);
}
function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60_000);
}
function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}
function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

// ─── Turkish customer names ──────────────────────────────────────────────────
const FEMALE_NAMES = [
  "Zeynep", "Fatma", "Esra", "Merve", "Selin", "Büşra", "Tuğçe", "Gamze",
  "Nur", "Hande", "İpek", "Ceren", "Derya", "Özlem", "Gizem", "Pınar",
  "Ece", "Serap", "Arzu", "Dilek", "Sibel", "Elif", "Aslı", "Yasemin",
  "Sevgi", "Deniz", "Burcu", "Melis", "Naz", "Damla",
];
const SURNAMES = [
  "Demir", "Çelik", "Şahin", "Yıldız", "Koç", "Arslan", "Doğan", "Kurt",
  "Aydın", "Erdoğan", "Karahan", "Öztürk", "Güneş", "Yıldırım", "Kılıç",
  "Aslan", "Çetin", "Polat", "Bulut", "Bozkurt", "Akın", "Türk", "Uçar",
  "Kaya", "Yılmaz", "Özdemir", "Çetin", "Sarı", "Tan", "Toprak",
];
const PHONES = () => `05${rnd(30, 59)}${rnd(1000000, 9999999)}`;

const TODAY = new Date(2026, 3, 3); // 3 Nisan 2026
const MONTHS = [
  { year: 2026, month: 1 },
  { year: 2026, month: 2 },
  { year: 2026, month: 3 },
  { year: 2026, month: 4 },
];

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Glow Atelier seed başlıyor...\n");

  // ── 1. Müşteriler ── (en az 15 yeni)
  console.log("👥 Müşteriler ekleniyor...");
  const existingCusts = await p.customers.findMany({
    where: { TenantId: TENANT_ID },
    select: { Id: true },
  });
  const customers: number[] = existingCusts.map((c) => c.Id);

  const needCount = Math.max(15, 30 - customers.length);
  for (let i = 0; i < needCount; i++) {
    const name = pick(FEMALE_NAMES);
    const surname = pick(SURNAMES);
    const since = d(2025, rnd(1, 12), rnd(1, 28));
    const cust = await p.customers.create({
      data: {
        TenantId: TENANT_ID,
        Name: name,
        Surname: surname,
        Phone: PHONES(),
        Email: `${name.toLowerCase().replace(/[İıĞğÜüŞşÖöÇç]/g, (c) => {
          const map: Record<string, string> = { İ: "i", ı: "i", Ğ: "g", ğ: "g", Ü: "u", ü: "u", Ş: "s", ş: "s", Ö: "o", ö: "o", Ç: "c", ç: "c" };
          return map[c] || c;
        })}.${surname.toLowerCase().replace(/[İıĞğÜüŞşÖöÇç]/g, (c) => {
          const map: Record<string, string> = { İ: "i", ı: "i", Ğ: "g", ğ: "g", Ü: "u", ü: "u", Ş: "s", ş: "s", Ö: "o", ö: "o", Ç: "c", ç: "c" };
          return map[c] || c;
        })}@example.com`,
        CustomerSince: since,
        IsActive: true,
        CDate: since,
      },
    });
    customers.push(cust.Id);
  }
  console.log(`  ✓ ${needCount} yeni müşteri eklendi (toplam ${customers.length})`);

  // ── 2. Randevular + Ödemeler + Komisyonlar (Ocak–Nisan 2026) ──
  console.log("📅 Randevular & ödemeler oluşturuluyor...");
  let totalAppts = 0;
  let totalPayments = 0;

  for (const { year, month } of MONTHS) {
    const days = daysInMonth(year, month);
    const endDay = year === 2026 && month === 4 ? 3 : days;

    for (let day = 1; day <= endDay; day++) {
      const date = new Date(year, month - 1, day);
      const isPast = date < TODAY;
      const isToday = date.toDateString() === TODAY.toDateString();
      const weekend = isWeekend(date);

      let apptCount: number;
      if (isToday) apptCount = rnd(6, 10);
      else if (isPast && !weekend) apptCount = rnd(5, 12);
      else if (isPast && weekend) apptCount = rnd(2, 6);
      else apptCount = rnd(3, 8);

      const slots = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

      for (let i = 0; i < apptCount && i < slots.length; i++) {
        const hour = slots[i];
        const staff = pick(STAFF);
        const treatment = pick(TREATMENTS);
        const customerId = pick(customers);

        const startTime = d(year, month, day, hour, pick([0, 15, 30]));
        const endTime = addMinutes(startTime, treatment.duration);

        let status: number;
        if (isToday) {
          status = pick([1, 1, 1, 2, 2, 3, 4, 5]);
        } else if (isPast) {
          const r = Math.random();
          if (r < 0.72) status = 3;
          else if (r < 0.85) status = 4;
          else status = 5;
        } else {
          status = pick([1, 2]);
        }

        const appt = await p.appointments.create({
          data: {
            TenantId: TENANT_ID,
            CustomerId: customerId,
            StaffId: staff.id,
            TreatmentId: treatment.id,
            StartTime: startTime,
            EndTime: endTime,
            Status: status,
            IsRecurring: false,
            SessionNumber: 1,
            IsActive: true,
            CDate: startTime,
          },
        });
        totalAppts++;

        // Tamamlanan randevular için ödeme + komisyon
        if (status === 3) {
          const paymentMethod = pick([1, 1, 1, 2, 2, 2, 2, 3]);
          const variance = 1 + (Math.random() - 0.5) * 0.1;
          const amount = Math.round(treatment.price * variance);

          const payment = await p.appointmentPayments.create({
            data: {
              TenantId: TENANT_ID,
              AppointmentId: appt.Id,
              Amount: amount,
              CurrencyId: CURRENCY_ID,
              ExchangeRateToTry: 1.0,
              AmountInTry: amount,
              PaymentMethod: paymentMethod,
              PaidAt: addMinutes(endTime, rnd(0, 15)),
              IsActive: true,
              CDate: endTime,
            },
          });
          totalPayments++;

          const commRate = staff.commissionRate + rnd(-5, 5);
          const commAmount = Math.round(amount * (commRate / 100));
          const salonShare = amount - commAmount;
          const isPaid = isPast && Math.random() > 0.3;

          await p.staffCommissionRecords.create({
            data: {
              TenantId: TENANT_ID,
              StaffId: staff.id,
              AppointmentPaymentId: payment.Id,
              CommissionRate: commRate,
              PaymentAmountInTry: amount,
              CommissionAmountInTry: commAmount,
              SalonShareInTry: salonShare,
              IsPaid: isPaid,
              PaidAt: isPaid ? addMinutes(payment.PaidAt, rnd(60, 4320)) : null,
              IsActive: true,
              CDate: payment.PaidAt,
            },
          });
        }
      }
    }
    console.log(`  ✓ ${year}/${month} tamamlandı`);
  }
  console.log(`  → Toplam ${totalAppts} randevu, ${totalPayments} ödeme`);

  // ── 3. Giderler ──
  console.log("💸 Giderler ekleniyor...");
  const fixedExpenses = [
    { catId: 200, amount: 22000, desc: "Aylık kira" },
    { catId: 203, amount: 3200, desc: "Elektrik faturası" },
    { catId: 204, amount: 800, desc: "Su faturası" },
    { catId: 205, amount: 1500, desc: "Doğalgaz faturası" },
    { catId: 202, amount: 45000, desc: "Personel maaşları" },
    { catId: 206, amount: 4000, desc: "Sosyal medya reklamları" },
    { catId: 208, amount: 6000, desc: "SGK & vergi ödemesi" },
  ];

  const variableExpenses = [
    { catId: 201, minAmt: 2000, maxAmt: 5000, desc: "Malzeme/ürün alımı" },
    { catId: 207, minAmt: 500, maxAmt: 3000, desc: "Ekipman bakım" },
    { catId: 209, minAmt: 300, maxAmt: 1500, desc: "Çeşitli gider" },
  ];

  let totalExpenses = 0;
  for (const { year, month } of MONTHS) {
    // Sabit aylık giderler
    for (const fe of fixedExpenses) {
      const v = fe.amount + rnd(Math.round(-fe.amount * 0.05), Math.round(fe.amount * 0.05));
      await p.expenses.create({
        data: {
          TenantId: TENANT_ID,
          ExpenseCategoryId: fe.catId,
          Amount: v,
          CurrencyId: CURRENCY_ID,
          ExchangeRateToTry: 1.0,
          AmountInTry: v,
          Description: `${fe.desc} — ${month}/${year}`,
          ExpenseDate: d(year, month, rnd(1, 5)),
          IsActive: true,
          CDate: d(year, month, rnd(1, 5)),
        },
      });
      totalExpenses++;
    }

    // Değişken haftalık giderler
    for (const ve of variableExpenses) {
      const weeklyCount = rnd(2, 4);
      for (let w = 0; w < weeklyCount; w++) {
        const amt = rnd(ve.minAmt, ve.maxAmt);
        const expDay = Math.min(1 + w * 7 + rnd(0, 3), daysInMonth(year, month));
        await p.expenses.create({
          data: {
            TenantId: TENANT_ID,
            ExpenseCategoryId: ve.catId,
            Amount: amt,
            CurrencyId: CURRENCY_ID,
            ExchangeRateToTry: 1.0,
            AmountInTry: amt,
            Description: `${ve.desc} — Hafta ${w + 1}, ${month}/${year}`,
            ExpenseDate: d(year, month, expDay),
            IsActive: true,
            CDate: d(year, month, expDay),
          },
        });
        totalExpenses++;
      }
    }
  }
  console.log(`  → ${totalExpenses} gider kaydı oluşturuldu`);

  // ── 4. Müşteri borçları & tahsilatlar ──
  console.log("💰 Borç/alacak kayıtları ekleniyor...");
  const debtStatuses = ["Pending", "PartiallyPaid", "Paid"];
  let debtCount = 0;

  for (let i = 0; i < 20; i++) {
    const customerId = pick(customers);
    const type = Math.random() > 0.4 ? "Receivable" : "Debt";
    const amount = rnd(200, 4000);
    const statusPick = pick(debtStatuses);
    const paidAmount = statusPick === "Paid" ? amount : statusPick === "PartiallyPaid" ? rnd(50, amount - 50) : 0;
    const createdAt = d(2026, rnd(1, 3), rnd(1, 28));

    const debt = await p.customerDebts.create({
      data: {
        TenantId: TENANT_ID,
        CustomerId: customerId,
        Type: type,
        Amount: amount,
        PaidAmount: paidAmount,
        Currency: "TRY",
        Description: type === "Receivable"
          ? pick(["Bakım paketi alacağı", "Önceki seans alacağı", "Sezon kampanyası alacağı"])
          : pick(["Malzeme borcu", "Erken ödeme borcu", "Fark borcu"]),
        Status: statusPick,
        DueDate: addMinutes(createdAt, rnd(7, 60) * 24 * 60),
        Source: "Manual",
        IsActive: true,
        CDate: createdAt,
      },
    });
    debtCount++;

    if (paidAmount > 0) {
      const installments = statusPick === "Paid" ? rnd(1, 3) : 1;
      const perInstall = Math.round(paidAmount / installments);
      for (let inst = 0; inst < installments; inst++) {
        await p.customerDebtPayments.create({
          data: {
            TenantId: TENANT_ID,
            CustomerDebtId: debt.Id,
            Amount: inst === installments - 1 ? paidAmount - perInstall * (installments - 1) : perInstall,
            PaymentMethod: pick(["Cash", "Card", "BankTransfer"]),
            PaymentDate: addMinutes(createdAt, (inst + 1) * rnd(1440, 10080)),
            IsActive: true,
            CDate: createdAt,
          },
        });
      }
    }
  }
  console.log(`  → ${debtCount} borç/alacak kaydı oluşturuldu`);

  // ── 5. Paket satışları ──
  console.log("📦 Paket satışları ekleniyor...");
  const packageDefs = [
    { sessions: 5, discountPct: 10 },
    { sessions: 8, discountPct: 15 },
    { sessions: 10, discountPct: 20 },
  ];

  let pkgCount = 0;
  for (let i = 0; i < 18; i++) {
    const customerId = pick(customers);
    const treatment = pick(TREATMENTS.filter((t) => t.price >= 200));
    const pkg = pick(packageDefs);
    const totalPrice = Math.round(treatment.price * pkg.sessions * (1 - pkg.discountPct / 100));
    const usedSessions = rnd(0, pkg.sessions);
    const status = usedSessions >= pkg.sessions ? 2 : 1;
    const startDate = d(2026, rnd(1, 3), rnd(1, 20));

    const sale = await p.packageSales_Packages.create({
      data: {
        TenantId: TENANT_ID,
        CustomerId: customerId,
        TreatmentId: treatment.id,
        StaffId: pick(STAFF).id,
        TotalSessions: pkg.sessions,
        UsedSessions: usedSessions,
        TotalPrice: totalPrice,
        PaidAmount: totalPrice,
        PaymentMethod: pick([1, 2, 3]),
        StartDate: startDate,
        EndDate: addMinutes(startDate, pkg.sessions * 30 * 24 * 60),
        Status: status,
        IsActive: true,
        CDate: startDate,
      },
    });
    pkgCount++;

    await p.packageSales_Payments.create({
      data: {
        PackageSaleId: sale.Id,
        TenantId: TENANT_ID,
        Amount: totalPrice,
        PaymentMethod: pick([1, 2, 3]),
        PaidAt: startDate,
        IsActive: true,
        CDate: startDate,
      },
    });

    for (let u = 0; u < usedSessions; u++) {
      await p.packageSales_Usages.create({
        data: {
          PackageSaleId: sale.Id,
          TenantId: TENANT_ID,
          UsageDate: addMinutes(startDate, (u + 1) * rnd(7, 21) * 24 * 60),
          StaffId: pick(STAFF).id,
          IsActive: true,
          CDate: startDate,
        },
      });
    }
  }
  console.log(`  → ${pkgCount} paket satışı oluşturuldu`);

  // ── 6. Ürün satışları ──
  console.log("🛍️ Ürün satışları ekleniyor...");
  let prodSaleCount = 0;
  for (const { year, month } of MONTHS) {
    const salesInMonth = rnd(15, 25);
    const daysM = daysInMonth(year, month);
    for (let i = 0; i < salesInMonth; i++) {
      const product = pick(PRODUCTS);
      const qty = rnd(1, 3);
      const total = product.price * qty;
      const saleDate = d(year, month, rnd(1, daysM), rnd(10, 19));
      await p.productSales.create({
        data: {
          TenantId: TENANT_ID,
          ProductId: product.id,
          CustomerId: pick(customers),
          StaffId: pick(STAFF).id,
          Quantity: qty,
          UnitPrice: product.price,
          TotalAmount: total,
          CurrencyId: CURRENCY_ID,
          ExchangeRateToTry: 1.0,
          AmountInTry: total,
          PaymentMethod: pick([1, 2, 3]),
          SaleDate: saleDate,
          IsActive: true,
          CDate: saleDate,
        },
      });
      prodSaleCount++;
    }
  }
  console.log(`  → ${prodSaleCount} ürün satışı oluşturuldu`);

  // ── 7. In-App Bildirimler ──
  console.log("🔔 Bildirimler ekleniyor...");
  const notifTemplates = [
    { type: "Appointment", title: "Yeni randevu oluşturuldu", message: "Bugün saat {hour}:00'da randevunuz var." },
    { type: "Payment", title: "Ödeme alındı", message: "{amount} TL tutarında ödeme başarıyla alındı." },
    { type: "Reminder", title: "Randevu hatırlatması", message: "Yarın saat {hour}:00'da randevunuz bulunmaktadır." },
    { type: "System", title: "Sistem güncellemesi", message: "Yeni özellikler eklendi, hemen keşfedin!" },
    { type: "Commission", title: "Komisyon ödemesi", message: "{amount} TL komisyon ödemeniz onaylandı." },
  ];

  for (let i = 0; i < 20; i++) {
    const tmpl = pick(notifTemplates);
    const hour = rnd(9, 19);
    const amount = rnd(100, 3000);
    await p.inAppNotifications.create({
      data: {
        TenantId: TENANT_ID,
        UserId: pick(STAFF).id,
        Type: tmpl.type,
        Title: tmpl.title,
        Message: tmpl.message.replace("{hour}", String(hour)).replace("{amount}", String(amount)),
        IsRead: Math.random() > 0.4,
        CDate: d(2026, rnd(1, 4), rnd(1, 28), rnd(8, 20)),
        IsActive: true,
      },
    });
  }
  console.log("  → 20 bildirim oluşturuldu");

  console.log("\n✅ Glow Atelier seed tamamlandı!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
