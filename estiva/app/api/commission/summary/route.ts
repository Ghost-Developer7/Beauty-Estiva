import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = { TenantId: user!.tenantId, IsActive: true };

    if (month && year) {
      const m = parseInt(month);
      const y = parseInt(year);
      where.AppointmentPayments = {
        PaidAt: {
          gte: new Date(y, m - 1, 1),
          lte: new Date(y, m, 0, 23, 59, 59),
        },
      };
    }

    const records = await prisma.staffCommissionRecords.findMany({
      where,
      include: {
        Users: { select: { Id: true, Name: true, Surname: true } },
      },
    });

    const map: Record<number, {
      staffId: number;
      staffFullName: string;
      totalPaymentsInTry: number;
      totalCommissionInTry: number;
      totalSalonShareInTry: number;
      paidCommissionInTry: number;
      unpaidCommissionInTry: number;
      recordCount: number;
    }> = {};

    for (const r of records) {
      if (!map[r.StaffId]) {
        map[r.StaffId] = {
          staffId: r.StaffId,
          staffFullName: `${r.Users.Name} ${r.Users.Surname}`.trim(),
          totalPaymentsInTry: 0,
          totalCommissionInTry: 0,
          totalSalonShareInTry: 0,
          paidCommissionInTry: 0,
          unpaidCommissionInTry: 0,
          recordCount: 0,
        };
      }
      const commission = Number(r.CommissionAmountInTry);
      const salon = Number(r.SalonShareInTry);
      const payment = Number(r.PaymentAmountInTry);

      map[r.StaffId].totalPaymentsInTry += payment;
      map[r.StaffId].totalCommissionInTry += commission;
      map[r.StaffId].totalSalonShareInTry += salon;
      map[r.StaffId].recordCount += 1;

      if (r.IsPaid) {
        map[r.StaffId].paidCommissionInTry += commission;
      } else {
        map[r.StaffId].unpaidCommissionInTry += commission;
      }
    }

    return success(Object.values(map));
  } catch (err) {
    console.error("Commission summary GET error:", err);
    return serverError();
  }
}
