import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// POST /api/subscription/start-trial — Start 14-day trial [Owner]
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner"]);
    if (error) return error;

    // Check if already had a trial
    const existingTrial = await prisma.tenantSubscriptions.findFirst({
      where: { TenantId: user!.tenantId, IsTrialPeriod: true },
    });

    if (existingTrial) return fail("Deneme süresi daha önce kullanılmış");

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);

    // Find the basic plan or first plan
    const plan = await prisma.subscriptionPlans.findFirst({
      where: { IsActive: true },
      orderBy: { MonthlyPrice: "asc" },
    });

    if (!plan) return fail("Abonelik planı bulunamadı");

    const subscription = await prisma.tenantSubscriptions.create({
      data: {
        TenantId: user!.tenantId,
        SubscriptionPlanId: plan.Id,
        PriceSold: 0,
        StartDate: now,
        EndDate: trialEnd,
        IsActive: true,
        IsTrialPeriod: true,
        TrialEndDate: trialEnd,
        PaymentStatus: "Trial",
        CUser: user!.id,
        CDate: now,
      },
    });

    // Update tenant's subscription plan
    await prisma.tenants.update({
      where: { Id: user!.tenantId },
      data: { SubscriptionPlanId: plan.Id },
    });

    return success(subscription, "14 günlük deneme süresi başlatıldı");
  } catch (error) {
    console.error("Start trial error:", error);
    return serverError();
  }
}
