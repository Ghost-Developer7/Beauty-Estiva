import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

// GET /api/subscription/status — Subscription status [Auth]
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const subscription = await prisma.tenantSubscriptions.findFirst({
      where: { TenantId: user!.tenantId, IsActive: true },
      orderBy: { StartDate: "desc" },
    });

    const now = new Date();
    let isActive = false;
    let isTrialPeriod = false;

    if (subscription) {
      if (subscription.IsTrialPeriod && subscription.TrialEndDate) {
        isTrialPeriod = new Date(subscription.TrialEndDate) >= now;
        isActive = isTrialPeriod;
      } else {
        isActive = new Date(subscription.EndDate) >= now && !subscription.IsCancelled;
      }
    }

    return success({ isActive, isTrialPeriod });
  } catch (error) {
    console.error("Subscription status GET error:", error);
    return serverError();
  }
}
