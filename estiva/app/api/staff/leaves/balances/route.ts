import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const hrInfos = await prisma.staffHRInfos.findMany({
      where: { TenantId: user!.tenantId, IsActive: true },
      include: {
        Users: {
          select: { Id: true, Name: true, Surname: true },
        },
      },
    });

    const balances = hrInfos.map((hr) => ({
      staffId: hr.StaffId,
      staffName: `${hr.Users.Name} ${hr.Users.Surname}`,
      annualLeaveEntitlement: hr.AnnualLeaveEntitlement,
      usedLeaveDays: hr.UsedLeaveDays,
      remainingLeaveDays: hr.AnnualLeaveEntitlement - hr.UsedLeaveDays,
    }));

    return success(balances);
  } catch (error) {
    console.error("Leave balances GET error:", error);
    return serverError();
  }
}
