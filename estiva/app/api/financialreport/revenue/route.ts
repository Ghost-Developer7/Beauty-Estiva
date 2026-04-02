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
    const staffId = searchParams.get("staffId");

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const paymentWhere: any = { TenantId: user!.tenantId, IsActive: true };
    if (startDate || endDate) paymentWhere.PaidAt = dateFilter;

    const payments = await prisma.appointmentPayments.findMany({
      where: paymentWhere,
      include: {
        Appointments: {
          select: {
            Id: true,
            StaffId: true,
            TreatmentId: true,
            Users: { select: { Name: true, Surname: true } },
            Treatments: { select: { Name: true } },
          },
        },
      },
    });

    const filtered = staffId
      ? payments.filter((p) => p.Appointments.StaffId === parseInt(staffId))
      : payments;

    const byStaff: Record<number, { label: string; count: number; amountInTry: number }> = {};
    const byTreatment: Record<number, { label: string; count: number; amountInTry: number }> = {};
    const byMethod: Record<number, { label: string; count: number; amountInTry: number }> = {};
    const byCurrency: Record<string, { label: string; count: number; amountInTry: number }> = {};
    const daily: Record<string, number> = {};

    for (const p of filtered) {
      const sid = p.Appointments.StaffId;
      const tid = p.Appointments.TreatmentId;
      const amt = Number(p.AmountInTry);
      const m = p.PaymentMethod;
      const cur = p.Currency ?? "TRY";

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
      byStaff[sid].amountInTry += amt;

      if (!byTreatment[tid]) {
        byTreatment[tid] = {
          label: p.Appointments.Treatments?.Name ?? "Bilinmiyor",
          count: 0,
          amountInTry: 0,
        };
      }
      byTreatment[tid].count += 1;
      byTreatment[tid].amountInTry += amt;

      if (!byMethod[m]) {
        byMethod[m] = { label: PAYMENT_LABELS[m] ?? "Diğer", count: 0, amountInTry: 0 };
      }
      byMethod[m].count += 1;
      byMethod[m].amountInTry += amt;

      if (!byCurrency[cur]) {
        byCurrency[cur] = { label: cur, count: 0, amountInTry: 0 };
      }
      byCurrency[cur].count += 1;
      byCurrency[cur].amountInTry += amt;

      const day = p.PaidAt ? new Date(p.PaidAt).toISOString().slice(0, 10) : "";
      if (day) daily[day] = (daily[day] ?? 0) + amt;
    }

    const totalAmountInTry = filtered.reduce((s, p) => s + Number(p.AmountInTry), 0);

    return success({
      startDate: startDate ?? "",
      endDate: endDate ?? "",
      totalAmountInTry,
      paymentCount: filtered.length,
      appointmentCount: new Set(filtered.map((p) => p.Appointments.Id)).size,
      byPaymentMethod: Object.values(byMethod).sort((a, b) => b.amountInTry - a.amountInTry),
      byCurrency: Object.values(byCurrency).sort((a, b) => b.amountInTry - a.amountInTry),
      byTreatment: Object.values(byTreatment).sort((a, b) => b.amountInTry - a.amountInTry),
      byStaff: Object.values(byStaff).sort((a, b) => b.amountInTry - a.amountInTry),
      dailyBreakdown: Object.entries(daily)
        .map(([date, amountInTry]) => ({ date, amountInTry }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (err) {
    console.error("Financial revenue error:", err);
    return serverError();
  }
}
