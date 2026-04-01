import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";
import { getPaginationParams, paginatedResponse } from "@/lib/pagination";

// GET /api/admin/subscriptionplan/tenants — List tenants with their plans
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["SuperAdmin"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search") || "";

    const where: any = { IsActive: true };
    if (search) {
      where.OR = [
        { CompanyName: { contains: search } },
        { TaxNumber: { contains: search } },
      ];
    }

    const [tenants, totalCount] = await Promise.all([
      prisma.tenants.findMany({
        where,
        select: {
          Id: true,
          TenantUUID: true,
          CompanyName: true,
          Phone: true,
          SubscriptionPlanId: true,
          CDate: true,
          SubscriptionPlans: {
            select: { Id: true, Name: true },
          },
          TenantSubscriptions: {
            where: { IsActive: true },
            orderBy: { StartDate: "desc" },
            take: 1,
            select: {
              Id: true,
              StartDate: true,
              EndDate: true,
              IsTrialPeriod: true,
              IsCancelled: true,
              PaymentStatus: true,
            },
          },
        },
        orderBy: { CDate: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.tenants.count({ where }),
    ]);

    const items = tenants.map((t) => ({
      id: t.Id,
      tenantUUID: t.TenantUUID,
      companyName: t.CompanyName,
      phone: t.Phone,
      plan: t.SubscriptionPlans ? { id: t.SubscriptionPlans.Id, name: t.SubscriptionPlans.Name } : null,
      subscription: t.TenantSubscriptions.length > 0 ? t.TenantSubscriptions[0] : null,
      cDate: t.CDate,
    }));

    return success(paginatedResponse(items, totalCount, page, pageSize));
  } catch (error) {
    console.error("Admin tenants GET error:", error);
    return serverError();
  }
}
