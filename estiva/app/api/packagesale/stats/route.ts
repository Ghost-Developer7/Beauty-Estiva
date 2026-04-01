import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/packagesale/stats — Package sale statistics
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const packages = await prisma.packageSales_Packages.findMany({
      where: { TenantId: user!.tenantId, IsActive: true },
    });

    const active = packages.filter((p) => p.Status === 1);
    const completed = packages.filter((p) => p.Status === 2);
    const expired = packages.filter((p) => p.Status === 3);

    return success({
      activeCount: active.length,
      completedCount: completed.length,
      expiredCount: expired.length,
      activeTotalPrice: active.reduce((sum, p) => sum + Number(p.TotalPrice), 0),
      completedTotalPrice: completed.reduce((sum, p) => sum + Number(p.TotalPrice), 0),
      expiredTotalPrice: expired.reduce((sum, p) => sum + Number(p.TotalPrice), 0),
    });
  } catch (error) {
    console.error("Package sale stats error:", error);
    return serverError();
  }
}
