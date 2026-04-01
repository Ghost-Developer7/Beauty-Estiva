import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// GET /api/subscription/current — Current tenant subscription [Owner]
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner"]);
    if (error) return error;

    const subscription = await prisma.tenantSubscriptions.findFirst({
      where: { TenantId: user!.tenantId, IsActive: true },
      include: { SubscriptionPlans: true },
      orderBy: { StartDate: "desc" },
    });

    if (!subscription) return success(null);

    return success({
      id: subscription.Id,
      planName: subscription.SubscriptionPlans.Name,
      planId: subscription.SubscriptionPlanId,
      priceSold: subscription.PriceSold,
      startDate: subscription.StartDate,
      endDate: subscription.EndDate,
      isTrialPeriod: subscription.IsTrialPeriod,
      trialEndDate: subscription.TrialEndDate,
      isCancelled: subscription.IsCancelled,
      autoRenew: subscription.AutoRenew,
      paymentStatus: subscription.PaymentStatus,
    });
  } catch (error) {
    console.error("Subscription current GET error:", error);
    return serverError();
  }
}
