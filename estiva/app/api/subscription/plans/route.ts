import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";

// GET /api/subscription/plans — List active plans (public, no auth)
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlans.findMany({
      where: { IsActive: true },
      orderBy: { MonthlyPrice: "asc" },
    });

    return success(
      plans.map((p) => ({
        id: p.Id,
        name: p.Name,
        description: p.Description,
        monthlyPrice: p.MonthlyPrice,
        yearlyPrice: p.YearlyPrice,
        maxStaffCount: p.MaxStaffCount,
        maxBranchCount: p.MaxBranchCount,
        hasSmsIntegration: p.HasSmsIntegration,
        hasAiFeatures: p.HasAiFeatures,
        hasSocialMediaIntegration: p.HasSocialMediaIntegration,
        hasWhatsappIntegration: p.HasWhatsappIntegration,
        features: p.Features,
        validityMonths: p.ValidityMonths,
      }))
    );
  } catch (error) {
    console.error("Subscription plans GET error:", error);
    return serverError();
  }
}
