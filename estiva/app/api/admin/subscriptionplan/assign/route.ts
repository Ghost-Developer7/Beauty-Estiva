import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// POST /api/admin/subscriptionplan/assign — Assign plan to tenant
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["SuperAdmin"]);
    if (error) return error;

    const body = await req.json();
    const { tenantId, planId, months } = body;

    if (!tenantId || !planId) return fail("tenantId ve planId zorunludur.");

    const tenant = await prisma.tenants.findUnique({ where: { Id: tenantId } });
    if (!tenant) return notFound("Tenant bulunamadı.");

    const plan = await prisma.subscriptionPlans.findUnique({ where: { Id: planId } });
    if (!plan) return notFound("Plan bulunamadı.");

    const now = new Date();
    const endDate = new Date(now);
    const durationMonths = months || plan.ValidityMonths || 1;
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Deactivate existing subscriptions
    await prisma.tenantSubscriptions.updateMany({
      where: { TenantId: tenantId, IsActive: true },
      data: { IsActive: false, UUser: user!.id, UDate: now },
    });

    // Create new subscription
    const subscription = await prisma.tenantSubscriptions.create({
      data: {
        TenantId: tenantId,
        SubscriptionPlanId: planId,
        PriceSold: 0,
        StartDate: now,
        EndDate: endDate,
        IsActive: true,
        PaymentStatus: "AdminAssigned",
        CUser: user!.id,
        CDate: now,
      },
    });

    // Update tenant's plan reference
    await prisma.tenants.update({
      where: { Id: tenantId },
      data: { SubscriptionPlanId: planId },
    });

    return success(subscription, "Plan tenant'a atandı.");
  } catch (error) {
    console.error("Admin assign plan error:", error);
    return serverError();
  }
}
