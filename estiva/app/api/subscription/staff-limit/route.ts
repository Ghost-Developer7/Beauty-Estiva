import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

// GET /api/subscription/staff-limit — Staff limit check [Auth]
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const tenant = await prisma.tenants.findUnique({
      where: { Id: user!.tenantId },
      include: { SubscriptionPlans: true },
    });

    const currentCount = await prisma.users.count({
      where: { TenantId: user!.tenantId, IsActive: true },
    });

    const maxCount = tenant?.SubscriptionPlans?.MaxStaffCount || 0;

    return success({
      canAdd: currentCount < maxCount,
      currentCount,
      maxCount,
    });
  } catch (error) {
    console.error("Staff limit GET error:", error);
    return serverError();
  }
}
