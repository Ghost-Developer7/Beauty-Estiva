import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

// GET /api/branch/limit — Branch limit check
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const tenant = await prisma.tenants.findUnique({
      where: { Id: user!.tenantId },
      include: { SubscriptionPlans: true },
    });

    const currentCount = await prisma.branches.count({
      where: { TenantId: user!.tenantId, IsActive: true },
    });

    const maxCount = tenant?.SubscriptionPlans?.MaxBranchCount || 0;

    return success({
      currentCount,
      maxCount,
      canAdd: currentCount < maxCount,
    });
  } catch (error) {
    console.error("Branch limit GET error:", error);
    return serverError();
  }
}
