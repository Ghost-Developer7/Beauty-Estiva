import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/commission/summary — Per-staff commission summary
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const records = await prisma.staffCommissionRecords.findMany({
      where: { TenantId: user!.tenantId, IsActive: true },
      include: {
        Users: { select: { Id: true, Name: true, Surname: true } },
      },
    });

    const summaryMap: Record<number, {
      staffId: number;
      staffName: string;
      totalEarned: number;
      totalPaid: number;
      unpaid: number;
    }> = {};

    for (const r of records) {
      if (!summaryMap[r.StaffId]) {
        summaryMap[r.StaffId] = {
          staffId: r.StaffId,
          staffName: `${r.Users.Name} ${r.Users.Surname}`,
          totalEarned: 0,
          totalPaid: 0,
          unpaid: 0,
        };
      }
      const amt = Number(r.CommissionAmountInTry);
      summaryMap[r.StaffId].totalEarned += amt;
      if (r.IsPaid) {
        summaryMap[r.StaffId].totalPaid += amt;
      } else {
        summaryMap[r.StaffId].unpaid += amt;
      }
    }

    return success(Object.values(summaryMap));
  } catch (err) {
    console.error("Commission summary GET error:", err);
    return serverError();
  }
}
