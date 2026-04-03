/**
 * Seed script — Güzel Eller Güzellik Merkezi (TenantId: 1)
 * Ocak 2026 – Nisan 2026 arası gerçekçi fake veri
 *
 * Çalıştır: npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const p = new PrismaClient();

// ─── Constants ───────────────────────────────────────────────────────────────
const TENANT_ID = 1;
const CURRENCY_ID = 1; // TRY

// Appointment status: 1=Scheduled 2=Confirmed 3=Completed 4=Cancelled 5=NoShow
// PaymentMethod: 1=Nakit 2=Kart 3=Havale 4=Çek 5=Diğer
// PackageSales Status: 1=Active 2=Completed 3=Cancelled

const STAFF = [
  { id: 1, name: "Mehmet Kara", commissionRate: 35 },
  { id: 2, name: "Ayşe Yılmaz", commissionRate: 30 },
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
  const dow = date.getDay(); // 0=Sun, 6=Sat
  return dow === 0 || dow === 6;
}
function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

// ─── Turkish customer names ───────────────────────────────────────────────────
const FEMALE_NAMES = [
  "Zeynep", "Fatma", "Esra", "Merve", "Selin", "Büşra", "Tuğçe", "Gamze",
  "Nur", "Hande", "İpek", "Ceren", "Derya", "Özlem", "Gizem", "Pınar",
  "Ece", "Serap", "Arzu", "Dilek",
];
const MALE_NAMES = [
  "Ahmet", "Mustafa", "Emre", "Can", "Berk", "Kemal", "Orhan", "Hasan",
  "Ali", "Murat",
];
const SURNAMES = [
  "Demir", "Çelik", "Şahin", "Yıldız", "Koç", "Arslan", "Doğan", "Kurt",
  "Aydın", "Erdoğan", "Karahan", "Öztürk", "Güneş", "Yıldırım", "Kılıç",
  "Aslan", "Çetin", "Polat", "Bulut", "Bozkurt",
];
const PHONES = () => `05${rnd(10, 59)}${rnd(1000000, 9999999)}`;

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seed başlıyor...\n");

  // ── 1. Ek hizmetler ──────────────────────────────────────────────────────
  console.log("📋 Hizmetler ekleniyor...");
  const treatmentDefs = [
    { name: "Saç Kesimi", duration: 30, price: 150, color: "#ec4899" },
    { name: "Manikür", duration: 45, price: 200, color: "#a855f7" },
    { name: "Pedikür", duration: 60, price: 250, color: "#8b5cf6" },
    { name: "Cilt Bakımı", duration: 60, price: 400, color: "#06b6d4" },
    { name: "Ombre / Balayage", duration: 120, price: 700, color: "#f59e0b" },
    { name: "Keratin Bakımı", duration: 90, price: 550, color: "#10b981" },
    { name: "Kalıcı Oje", duration: 30, price: 160, color: "#ef4444" },
    { name: "Kaş Tasarımı", duration: 20, price: 120, color: "#3b82f6" },
    { name: "Makyaj", duration: 60, price: 380, color: "#e879f9" },
  ];
  const treatments: { id: number; price: number; duration: number; name: string }[] = [];

  // Mevcut hizmet
  const existing = await p.treatments.findFirst({ where: { TenantId: TENANT_ID, IsActive: true } });
  if (existing) {
    treatments.push({ id: existing.Id, price: Number(existing.Price), duration: existing.DurationMinutes, name: existing.Name });
  }

  for (const td of treatmentDefs) {
    const already = await p.treatments.findFirst({ where: { TenantId: TENANT_ID, Name: td.name } });
    if (already) {
      treatments.push({ id: already.Id, price: Number(already.Price), duration: already.DurationMinutes, name: already.Name });
    } else {
      const t = await p.treatments.create({
        data: {
          TenantId: TENANT_ID,
          Name: td.name,
          DurationMinutes: td.duration,
          Price: td.price,
          Color: td.color,
          IsActive: true,
          CDate: new Date(),
        },
      });
      treatments.push({ id: t.Id, price: Number(t.Price), duration: t.DurationMinutes, name: t.Name });
    }
  }
  console.log(`  ✓ ${treatments.length} hizmet hazır`);

  // ── 2. Gider kategorileri ─────────────────────────────────────────────────
  console.log("📁 Gider kategorileri ekleniyor...");
  const expCatDefs = ["Kira", "Elektrik & Su", "Personel Gideri", "Ekipman", "Reklam"];
  const expCats: { id: number; name: string }[] = [];

  const malzeme = await p.expenseCategories.findFirst({ where: { TenantId: TENANT_ID } });
  if (malzeme) expCats.push({ id: malzeme.Id, name: malzeme.Name });

  for (const name of expCatDefs) {
    const already = await p.expenseCategories.findFirst({ where: { TenantId: TENANT_ID, Name: name } });
    if (already) {
      expCats.push({ id: already.Id, name: already.Name });
    } else {
      const cat = await p.expenseCategories.create({
        data: { TenantId: TENANT_ID, Name: name, IsActive: true, CDate: new Date() },
      });
      expCats.push({ id: cat.Id, name: cat.Name });
    }
  }
  console.log(`  ✓ ${expCats.length} gider kategorisi hazır`);

  // ── 3. Müşteriler ─────────────────────────────────────────────────────────
  console.log("👥 Müşteriler ekleniyor...");
  const existingCusts = await p.customers.findMany({ where: { TenantId: TENANT_ID }, select: { Id: true } });
  const customers: number[] = existingCusts.map((c) => c.Id);

  const needCount = 45 - customers.length;
  for (let i = 0; i < needCount; i++) {
    const isFemale = Math.random() > 0.35;
    const name = isFemale ? pick(FEMALE_NAMES) : pick(MALE_NAMES);
    const surname = pick(SURNAMES);
    const since = d(2024, rnd(1, 12), rnd(1, 28));
    const cust = await p.customers.create({
      data: {
        TenantId: TENANT_ID,
        Name: name,
        Surname: surname,
        Phone: PHONES(),
        Email: `${name.toLowerCase()}.${surname.toLowerCase()}@example.com`,
        CustomerSince: since,
        IsActive: true,
        CDate: since,
      },
    });
    customers.push(cust.Id);
  }
  console.log(`  ✓ ${customers.length} müşteri hazır`);

  // ── 4. Randevular + Ödemeler (Ocak–Nisan 2026) ───────────────────────────
  console.log("📅 Randevular & ödemeler oluşturuluyor...");

  const TODAY = new Date(2026, 3, 3); // 3 Nisan 2026

  // Ocak–Nisan arası
  const months = [
    { year: 2026, month: 1 },
    { year: 2026, month: 2 },
    { year: 2026, month: 3 },
    { year: 2026, month: 4 },
  ];

  let totalAppts = 0;
  let totalPayments = 0;

  for (const { year, month } of months) {
    const days = daysInMonth(year, month);
    const endDay = (year === 2026 && month === 4) ? 3 : days; // Nisan'da bugüne kadar

    for (let day = 1; day <= endDay; day++) {
      const date = new Date(year, month - 1, day);
      const isPast = date < TODAY;
      const isToday = date.toDateString() === TODAY.toDateString();
      const weekend = isWeekend(date);

      // Gün başına randevu sayısı
      let apptCount: number;
      if (isToday) apptCount = rnd(6, 10);
      else if (isPast && !weekend) apptCount = rnd(5, 12);
      else if (isPast && weekend) apptCount = rnd(2, 6);
      else apptCount = rnd(3, 8); // gelecek (normalde bu olmayacak ama)

      // Saat slotları (09:00–20:00)
      const slots = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

      for (let i = 0; i < apptCount && i < slots.length; i++) {
        const hour = slots[i];
        const staff = pick(STAFF);
        const treatment = pick(treatments);
        const customerId = pick(customers);

        const startTime = d(year, month, day, hour, pick([0, 15, 30]));
        const endTime = addMinutes(startTime, treatment.duration);

        // Status: geçmiş günler için ağırlıklı tamamlandı
        let status: number;
        if (isToday) {
          status = pick([1, 1, 1, 2, 2, 3, 4, 5]); // bugün çeşitli
        } else if (isPast) {
          const r = Math.random();
          if (r < 0.72) status = 3;       // Completed
          else if (r < 0.85) status = 4;  // Cancelled
          else status = 5;                 // NoShow
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

        // Tamamlananlar için ödeme
        if (status === 3) {
          const paymentMethod = pick([1, 1, 1, 2, 2, 2, 2, 3]); // Nakit 37.5%, Kart 50%, Havale 12.5%
          // Fiyat ±%10 dalgalanma
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

          // Komisyon kaydı
          const commRate = staff.commissionRate + rnd(-5, 5); // ±5 dalgalanma
          const commAmount = Math.round(amount * (commRate / 100));
          const salonShare = amount - commAmount;
          const isPaid = isPast && Math.random() > 0.3; // geçmiştekilerin %70'i ödenmiş

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

  // ── 5. Giderler ───────────────────────────────────────────────────────────
  console.log("💸 Giderler ekleniyor...");

  // Aylık sabit giderler
  const fixedExpenses = [
    { catName: "Kira", amount: 18000, desc: "Aylık kira" },
    { catName: "Elektrik & Su", amount: 2200, desc: "Elektrik ve su faturası" },
    { catName: "Personel Gideri", amount: 35000, desc: "Personel maaşları" },
    { catName: "Reklam", amount: 3500, desc: "Sosyal medya reklamları" },
  ];

  // Haftalık değişken giderler
  const variableExpenses = [
    { catName: "Malzeme", amounts: [800, 1200, 600, 1500, 900, 1100], desc: "Malzeme alımı" },
    { catName: "Ekipman", amounts: [0, 4500, 0, 0, 2200, 0], desc: "Ekipman bakım/onarım" },
  ];

  let totalExpenses = 0;
  for (const { year, month } of months) {
    // Sabit aylık
    for (const fe of fixedExpenses) {
      const cat = expCats.find((c) => c.name === fe.catName);
      if (!cat) continue;
      const v = fe.amount + rnd(-fe.amount * 0.05, fe.amount * 0.05);
      await p.expenses.create({
        data: {
          TenantId: TENANT_ID,
          ExpenseCategoryId: cat.id,
          Amount: Math.round(v),
          CurrencyId: CURRENCY_ID,
          ExchangeRateToTry: 1.0,
          AmountInTry: Math.round(v),
          Description: `${fe.desc} — ${month}/${year}`,
          ExpenseDate: d(year, month, 5),
          IsActive: true,
          CDate: d(year, month, 5),
        },
      });
      totalExpenses++;
    }

    // Değişken haftalık
    for (const ve of variableExpenses) {
      const cat = expCats.find((c) => c.name === ve.catName);
      if (!cat) continue;
      for (let week = 0; week < 4; week++) {
        const baseAmount = ve.amounts[month % ve.amounts.length] ?? 0;
        if (baseAmount === 0) continue;
        const v = baseAmount + rnd(-baseAmount * 0.2, baseAmount * 0.2);
        if (v < 50) continue;
        await p.expenses.create({
          data: {
            TenantId: TENANT_ID,
            ExpenseCategoryId: cat.id,
            Amount: Math.round(v),
            CurrencyId: CURRENCY_ID,
            ExchangeRateToTry: 1.0,
            AmountInTry: Math.round(v),
            Description: `${ve.desc} — Hafta ${week + 1}, ${month}/${year}`,
            ExpenseDate: d(year, month, 1 + week * 7),
            IsActive: true,
            CDate: d(year, month, 1 + week * 7),
          },
        });
        totalExpenses++;
      }
    }
  }
  console.log(`  → ${totalExpenses} gider kaydı oluşturuldu`);

  // ── 6. Müşteri borçları & tahsilatlar ────────────────────────────────────
  console.log("💰 Borç/alacak kayıtları ekleniyor...");
  const debtStatuses = ["Pending", "PartiallyPaid", "Paid"];
  let debtCount = 0;

  for (let i = 0; i < 25; i++) {
    const customerId = pick(customers);
    const type = Math.random() > 0.4 ? "Receivable" : "Debt";
    const amount = rnd(200, 3000);
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
        Description: type === "Receivable" ? "Sezon bakım paketi alacağı" : "Malzeme borcu",
        Status: statusPick,
        DueDate: addMinutes(createdAt, rnd(7, 60) * 24 * 60),
        Source: "Manual",
        IsActive: true,
        CDate: createdAt,
      },
    });
    debtCount++;

    // Ödemeler
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

  // ── 7. Paket satışları ────────────────────────────────────────────────────
  console.log("📦 Paket satışları ekleniyor...");
  const packageDefs = [
    { sessions: 5, discountPct: 10 },
    { sessions: 8, discountPct: 15 },
    { sessions: 10, discountPct: 20 },
  ];

  let pkgCount = 0;
  for (let i = 0; i < 20; i++) {
    const customerId = pick(customers);
    const treatment = pick(treatments.filter((t) => t.price >= 150));
    const pkg = pick(packageDefs);
    const totalPrice = Math.round(treatment.price * pkg.sessions * (1 - pkg.discountPct / 100));
    const usedSessions = rnd(0, pkg.sessions);
    const status = usedSessions >= pkg.sessions ? 2 : 1; // 2=Completed, 1=Active
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

    // Ödeme kaydı
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

    // Kullanım kayıtları
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

  // ── 8. Ürün satışları ─────────────────────────────────────────────────────
  console.log("🛍️ Ürün satışları ekleniyor...");

  const productDefs = [
    { name: "Saç Bakım Şampuanı", price: 185, stock: 50 },
    { name: "Argan Yağı Serumu", price: 320, stock: 30 },
    { name: "Renk Koruyucu Krem", price: 145, stock: 40 },
    { name: "Tırnak Güçlendirici", price: 95, stock: 60 },
    { name: "Cilt Nemlendirici", price: 260, stock: 25 },
  ];
  const products: { id: number; price: number }[] = [];

  for (const pd of productDefs) {
    const already = await p.products.findFirst({ where: { TenantId: TENANT_ID, Name: pd.name } });
    if (already) {
      products.push({ id: already.Id, price: Number(already.Price) });
    } else {
      const pr = await p.products.create({
        data: {
          TenantId: TENANT_ID,
          Name: pd.name,
          Price: pd.price,
          StockQuantity: pd.stock,
          IsActive: true,
          CDate: new Date(),
        },
      });
      products.push({ id: pr.Id, price: Number(pr.Price) });
    }
  }

  let prodSaleCount = 0;
  for (const { year, month } of months) {
    const salesInMonth = rnd(15, 30);
    const daysM = daysInMonth(year, month);
    for (let i = 0; i < salesInMonth; i++) {
      const product = pick(products);
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

  console.log("\n✅ Seed tamamlandı!");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());
