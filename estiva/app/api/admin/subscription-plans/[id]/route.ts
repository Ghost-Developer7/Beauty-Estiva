import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// GET /api/admin/subscription-plans/[id] — Single plan detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRoles(req, ["SuperAdmin"]);
    if (error) return error;

    const { id } = await params;
    const planId = parseInt(id);
    if (isNaN(planId)) return fail("Geçersiz plan ID.");

    const plan = await prisma.subscriptionPlans.findUnique({
      where: { Id: planId },
    });

    if (!plan) return notFound("Plan bulunamadı.");

    return success({
      id: plan.Id,
      name: plan.Name,
      description: plan.Description,
      monthlyPrice: plan.MonthlyPrice,
      yearlyPrice: plan.YearlyPrice,
      maxStaffCount: plan.MaxStaffCount,
      maxBranchCount: plan.MaxBranchCount,
      hasSmsIntegration: plan.HasSmsIntegration,
      hasAiFeatures: plan.HasAiFeatures,
      hasSocialMediaIntegration: plan.HasSocialMediaIntegration,
      hasWhatsappIntegration: plan.HasWhatsappIntegration,
      features: plan.Features,
      validityMonths: plan.ValidityMonths,
      isActive: plan.IsActive,
      cDate: plan.CDate,
    });
  } catch (error) {
    console.error("Admin plan GET error:", error);
    return serverError();
  }
}

// PUT /api/admin/subscription-plans/[id] — Update plan
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRoles(req, ["SuperAdmin"]);
    if (error) return error;

    const { id } = await params;
    const planId = parseInt(id);
    if (isNaN(planId)) return fail("Geçersiz plan ID.");

    const existing = await prisma.subscriptionPlans.findUnique({
      where: { Id: planId },
    });
    if (!existing) return notFound("Plan bulunamadı.");

    const body = await req.json();
    const data: any = { UUser: user!.id, UDate: new Date() };

    if (body.name !== undefined) data.Name = body.name;
    if (body.description !== undefined) data.Description = body.description;
    if (body.monthlyPrice !== undefined) data.MonthlyPrice = body.monthlyPrice;
    if (body.yearlyPrice !== undefined) data.YearlyPrice = body.yearlyPrice;
    if (body.maxStaffCount !== undefined) data.MaxStaffCount = body.maxStaffCount;
    if (body.maxBranchCount !== undefined) data.MaxBranchCount = body.maxBranchCount;
    if (body.hasSmsIntegration !== undefined) data.HasSmsIntegration = body.hasSmsIntegration;
    if (body.hasAiFeatures !== undefined) data.HasAiFeatures = body.hasAiFeatures;
    if (body.hasSocialMediaIntegration !== undefined) data.HasSocialMediaIntegration = body.hasSocialMediaIntegration;
    if (body.hasWhatsappIntegration !== undefined) data.HasWhatsappIntegration = body.hasWhatsappIntegration;
    if (body.features !== undefined) data.Features = body.features;
    if (body.validityMonths !== undefined) data.ValidityMonths = body.validityMonths;
    if (body.isActive !== undefined) data.IsActive = body.isActive;

    const updated = await prisma.subscriptionPlans.update({
      where: { Id: planId },
      data,
    });

    return success(updated, "Plan güncellendi.");
  } catch (error) {
    console.error("Admin plan PUT error:", error);
    return serverError();
  }
}
