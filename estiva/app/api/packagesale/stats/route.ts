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

    const totalRevenue = packages.reduce((sum, p) => sum + Number(p.TotalPrice), 0);

    return success({
      totalSales: packages.length,
      totalRevenue,
      activePackages: active.length,
      completedPackages: completed.length,
    });
  } catch (error) {
    console.error("Package sale stats error:", error);
    return serverError();
  }
}
