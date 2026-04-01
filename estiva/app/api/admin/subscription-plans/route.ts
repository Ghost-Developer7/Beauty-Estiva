import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError, notFound } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["SuperAdmin"]);
    if (error) return error;

    const plans = await prisma.subscriptionPlans.findMany({
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
        isActive: p.IsActive,
        cDate: p.CDate,
      }))
    );
  } catch (error) {
    console.error("Admin plans GET error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["SuperAdmin"]);
    if (error) return error;

    const body = await req.json();
    const {
      name, description, monthlyPrice, yearlyPrice, maxStaffCount,
      maxBranchCount, hasSmsIntegration, hasAiFeatures,
      hasSocialMediaIntegration, hasWhatsappIntegration, features, validityMonths,
    } = body;

    if (!name || monthlyPrice === undefined || yearlyPrice === undefined) {
      return fail("name, monthlyPrice ve yearlyPrice zorunludur");
    }

    const plan = await prisma.subscriptionPlans.create({
      data: {
        Name: name,
        Description: description || null,
        MonthlyPrice: monthlyPrice,
        YearlyPrice: yearlyPrice,
        MaxStaffCount: maxStaffCount || 5,
        MaxBranchCount: maxBranchCount || 1,
        HasSmsIntegration: hasSmsIntegration ?? false,
        HasAiFeatures: hasAiFeatures ?? false,
        HasSocialMediaIntegration: hasSocialMediaIntegration ?? false,
        HasWhatsappIntegration: hasWhatsappIntegration ?? false,
        Features: features || null,
        ValidityMonths: validityMonths || 0,
        CUser: user!.id,
        CDate: new Date(),
        IsActive: true,
      },
    });

    return success(plan, "Plan oluşturuldu");
  } catch (error) {
    console.error("Admin plans POST error:", error);
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["SuperAdmin"]);
    if (error) return error;

    const body = await req.json();
    const { id } = body;

    if (!id) return fail("Plan ID gereklidir");

    const existing = await prisma.subscriptionPlans.findUnique({
      where: { Id: id },
    });
    if (!existing) return notFound("Plan bulunamadı");

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
      where: { Id: id },
      data,
    });

    return success(updated, "Plan güncellendi");
  } catch (error) {
    console.error("Admin plans PUT error:", error);
    return serverError();
  }
}
