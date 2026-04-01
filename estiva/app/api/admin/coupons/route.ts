import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError, notFound } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["SuperAdmin"]);
    if (error) return error;

    const coupons = await prisma.coupons.findMany({
      orderBy: { CDate: "desc" },
      include: {
        Tenants: { select: { CompanyName: true } },
      },
    });

    return success(
      coupons.map((c) => ({
        id: c.Id,
        code: c.Code,
        description: c.Description,
        isPercentage: c.IsPercentage,
        discountAmount: c.DiscountAmount,
        startDate: c.StartDate,
        endDate: c.EndDate,
        maxUsageCount: c.MaxUsageCount,
        currentUsageCount: c.CurrentUsageCount,
        isGlobal: c.IsGlobal,
        specificTenantId: c.SpecificTenantId,
        specificTenantName: c.Tenants?.CompanyName || null,
        isActive: c.IsActive,
        cDate: c.CDate,
      }))
    );
  } catch (error) {
    console.error("Admin coupons GET error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["SuperAdmin"]);
    if (error) return error;

    const body = await req.json();
    const {
      code, description, isPercentage, discountAmount,
      startDate, endDate, maxUsageCount, isGlobal, specificTenantId,
    } = body;

    if (!code || discountAmount === undefined || !startDate || !endDate) {
      return fail("code, discountAmount, startDate ve endDate zorunludur");
    }

    // Check for duplicate code
    const existing = await prisma.coupons.findFirst({
      where: { Code: code, IsActive: true },
    });
    if (existing) return fail("Bu kupon kodu zaten mevcut");

    const coupon = await prisma.coupons.create({
      data: {
        Code: code,
        Description: description || null,
        IsPercentage: isPercentage ?? false,
        DiscountAmount: discountAmount,
        StartDate: new Date(startDate),
        EndDate: new Date(endDate),
        MaxUsageCount: maxUsageCount || null,
        CurrentUsageCount: 0,
        IsGlobal: isGlobal ?? true,
        SpecificTenantId: specificTenantId || null,
        CUser: user!.id,
        CDate: new Date(),
        IsActive: true,
      },
    });

    return success(coupon, "Kupon oluşturuldu");
  } catch (error) {
    console.error("Admin coupons POST error:", error);
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["SuperAdmin"]);
    if (error) return error;

    const body = await req.json();
    const { id } = body;

    if (!id) return fail("Kupon ID gereklidir");

    const existing = await prisma.coupons.findUnique({ where: { Id: id } });
    if (!existing) return notFound("Kupon bulunamadı");

    const data: any = { UUser: user!.id, UDate: new Date() };

    if (body.code !== undefined) data.Code = body.code;
    if (body.description !== undefined) data.Description = body.description;
    if (body.isPercentage !== undefined) data.IsPercentage = body.isPercentage;
    if (body.discountAmount !== undefined) data.DiscountAmount = body.discountAmount;
    if (body.startDate !== undefined) data.StartDate = new Date(body.startDate);
    if (body.endDate !== undefined) data.EndDate = new Date(body.endDate);
    if (body.maxUsageCount !== undefined) data.MaxUsageCount = body.maxUsageCount;
    if (body.isGlobal !== undefined) data.IsGlobal = body.isGlobal;
    if (body.specificTenantId !== undefined) data.SpecificTenantId = body.specificTenantId;
    if (body.isActive !== undefined) data.IsActive = body.isActive;

    const updated = await prisma.coupons.update({
      where: { Id: id },
      data,
    });

    return success(updated, "Kupon güncellendi");
  } catch (error) {
    console.error("Admin coupons PUT error:", error);
    return serverError();
  }
}
