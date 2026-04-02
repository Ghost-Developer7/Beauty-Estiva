import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

const PAYMENT_LABELS: Record<number, string> = {
  0: "Belirtilmedi",
  1: "Nakit",
  2: "Kredi Kartı",
  3: "Havale/EFT",
  4: "Çek",
  5: "Diğer",
};

export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const paymentWhere: any = { TenantId: user!.tenantId, IsActive: true };
    if (startDate || endDate) paymentWhere.PaidAt = dateFilter;

    const expenseWhere: any = { TenantId: user!.tenantId, IsActive: true };
    if (startDate || endDate) expenseWhere.ExpenseDate = dateFilter;

    const appointmentWhere: any = { TenantId: user!.tenantId, IsActive: true };
    if (startDate || endDate) appointmentWhere.StartTime = dateFilter;

    const [payments, expenses, allAppointments] = await Promise.all([
      prisma.appointmentPayments.findMany({
        where: paymentWhere,
        include: {
          Appointments: {
            select: {
              StaffId: true,
              TreatmentId: true,
              Users: { select: { Name: true, Surname: true } },
              Treatments: { select: { Name: true } },
            },
          },
        },
      }),
      prisma.expenses.findMany({
        where: expenseWhere,
        include: { ExpenseCategories: { select: { Name: true, Color: true } } },
      }),
      prisma.appointments.findMany({
        where: appointmentWhere,
        select: { Id: true, Status: true },
      }),
    ]);

    // Totals
    const totalRevenueTRY = payments.reduce((s, p) => s + Number(p.AmountInTry), 0);
    const totalExpenseTRY = expenses.reduce((s, e) => s + Number(e.AmountInTry), 0);

    // Appointment counts (Status 3 = Completed/paid)
    const paidAppointments = allAppointments.filter((a) => a.Status === 3).length;

    // Group by treatment
    const byTreatment: Record<number, { label: string; count: number; amountInTry: number }> = {};
    for (const p of payments) {
      const tid = p.Appointments.TreatmentId;
      if (!byTreatment[tid]) {
        byTreatment[tid] = {
          label: p.Appointments.Treatments?.Name ?? "Bilinmiyor",
          count: 0,
          amountInTry: 0,
        };
      }
      byTreatment[tid].count += 1;
      byTreatment[tid].amountInTry += Number(p.AmountInTry);
    }

    // Group by staff
    const byStaff: Record<number, { label: string; count: number; amountInTry: number }> = {};
    for (const p of payments) {
      const sid = p.Appointments.StaffId;
      if (!byStaff[sid]) {
        byStaff[sid] = {
          label: p.Appointments.Users
            ? `${p.Appointments.Users.Name} ${p.Appointments.Users.Surname}`.trim()
            : "Bilinmiyor",
          count: 0,
          amountInTry: 0,
        };
      }
      byStaff[sid].count += 1;
      byStaff[sid].amountInTry += Number(p.AmountInTry);
    }

    // Group by payment method
    const byMethod: Record<number, { label: string; count: number; amountInTry: number }> = {};
    for (const p of payments) {
      const m = p.PaymentMethod;
      if (!byMethod[m]) {
        byMethod[m] = { label: PAYMENT_LABELS[m] ?? "Diğer", count: 0, amountInTry: 0 };
      }
      byMethod[m].count += 1;
      byMethod[m].amountInTry += Number(p.AmountInTry);
    }

    // Group expenses by category
    const byCat: Record<string, { label: string; count: number; amountInTry: number }> = {};
    for (const e of expenses) {
      const key = e.ExpenseCategoryId ? String(e.ExpenseCategoryId) : "0";
      if (!byCat[key]) {
        byCat[key] = {
          label: e.ExpenseCategories?.Name ?? "Kategorisiz",
          count: 0,
          amountInTry: 0,
        };
      }
      byCat[key].count += 1;
      byCat[key].amountInTry += Number(e.AmountInTry);
    }

    // Daily revenue
    const dailyRevMap: Record<string, number> = {};
    for (const p of payments) {
      const day = p.PaidAt ? new Date(p.PaidAt).toISOString().slice(0, 10) : "";
      if (!day) continue;
      dailyRevMap[day] = (dailyRevMap[day] ?? 0) + Number(p.AmountInTry);
    }

    // Daily expense
    const dailyExpMap: Record<string, number> = {};
    for (const e of expenses) {
      const day = e.ExpenseDate ? new Date(e.ExpenseDate).toISOString().slice(0, 10) : "";
      if (!day) continue;
      dailyExpMap[day] = (dailyExpMap[day] ?? 0) + Number(e.AmountInTry);
    }

    const sortDesc = (arr: { label: string; count: number; amountInTry: number }[]) =>
      arr.sort((a, b) => b.amountInTry - a.amountInTry);

    return success({
      startDate: startDate ?? "",
      endDate: endDate ?? "",
      totalRevenueTRY,
      totalExpenseTRY,
      netIncomeTRY: totalRevenueTRY - totalExpenseTRY,
      totalAppointments: allAppointments.length,
      paidAppointments,
      unpaidAppointments: allAppointments.length - paidAppointments,
      topTreatments: sortDesc(Object.values(byTreatment)).slice(0, 10),
      topStaff: sortDesc(Object.values(byStaff)).slice(0, 10),
      paymentMethods: sortDesc(Object.values(byMethod)),
      topExpenseCategories: sortDesc(Object.values(byCat)).slice(0, 10),
      dailyRevenue: Object.entries(dailyRevMap)
        .map(([date, amountInTry]) => ({ date, amountInTry }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      dailyExpense: Object.entries(dailyExpMap)
        .map(([date, amountInTry]) => ({ date, amountInTry }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (err) {
    console.error("Financial dashboard error:", err);
    return serverError();
  }
}
