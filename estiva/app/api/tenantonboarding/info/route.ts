import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

// GET /api/tenantonboarding/info — Tenant info (auth required)
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const tenant = await prisma.tenants.findFirst({
      where: { Id: user!.tenantId, IsActive: true },
      select: {
        Id: true,
        TenantUUID: true,
        CompanyName: true,
        TaxNumber: true,
        TaxOffice: true,
        Address: true,
        Phone: true,
        Currency: true,
        Timezone: true,
        SubscriptionPlanId: true,
        CDate: true,
      },
    });

    if (!tenant) {
      return fail("Tenant bulunamadı.", "NOT_FOUND", 404);
    }

    return success(tenant);
  } catch (error) {
    console.error("Tenant info GET error:", error);
    return serverError();
  }
}
