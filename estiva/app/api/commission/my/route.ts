import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/commission/my — Current user's commission summary
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const myRecords = await prisma.staffCommissionRecords.findMany({
      where: {
        TenantId: user!.tenantId,
        StaffId: user!.id,
        IsActive: true,
      },
    });

    let totalEarned = 0;
    let totalPaid = 0;
    let unpaid = 0;

    for (const r of myRecords) {
      const amt = Number(r.CommissionAmountInTry);
      totalEarned += amt;
      if (r.IsPaid) {
        totalPaid += amt;
      } else {
        unpaid += amt;
      }
    }

    return success({
      staffId: user!.id,
      staffName: `${user!.name} ${user!.surname}`,
      totalEarned,
      totalPaid,
      unpaid,
      recordCount: myRecords.length,
    });
  } catch (err) {
    console.error("Commission my GET error:", err);
    return serverError();
  }
}
