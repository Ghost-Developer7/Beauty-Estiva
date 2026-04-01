import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/financialreport/revenue — Revenue breakdown
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
            StaffId: true,
            TreatmentId: true,
            Users: { select: { Id: true, Name: true, Surname: true } },
            Treatments: { select: { Id: true, Name: true } },
          },
        },
      },
    });

    const filteredPayments = staffId
      ? payments.filter((p) => p.Appointments.StaffId === parseInt(staffId))
      : payments;

    const byStaff: Record<number, { staffName: string; total: number }> = {};
    const byTreatment: Record<number, { treatmentName: string; total: number }> = {};
    const byMethod: Record<number, { total: number }> = {};

    for (const p of filteredPayments) {
      const sid = p.Appointments.StaffId;
      const tid = p.Appointments.TreatmentId;
      const amt = Number(p.AmountInTry);

      if (!byStaff[sid]) {
        byStaff[sid] = {
          staffName: `${p.Appointments.Users.Name} ${p.Appointments.Users.Surname}`,
          total: 0,
        };
      }
      byStaff[sid].total += amt;

      if (!byTreatment[tid]) {
        byTreatment[tid] = {
          treatmentName: p.Appointments.Treatments.Name,
          total: 0,
        };
      }
      byTreatment[tid].total += amt;

      if (!byMethod[p.PaymentMethod]) {
        byMethod[p.PaymentMethod] = { total: 0 };
      }
      byMethod[p.PaymentMethod].total += amt;
    }

    return success({
      byStaff: Object.entries(byStaff).map(([id, v]) => ({ staffId: parseInt(id), ...v })),
      byTreatment: Object.entries(byTreatment).map(([id, v]) => ({ treatmentId: parseInt(id), ...v })),
      byPaymentMethod: Object.entries(byMethod).map(([method, v]) => ({ paymentMethod: parseInt(method), ...v })),
    });
  } catch (err) {
    console.error("Financial revenue error:", err);
    return serverError();
  }
}
