import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription, requireRoles } from "@/lib/api-middleware";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/treatment/[id]
 * Get treatment by id.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { id } = await context.params;
    const treatmentId = parseInt(id);
    if (isNaN(treatmentId)) return fail("Geçersiz hizmet ID.", "VALIDATION_ERROR");

    const treatment = await prisma.treatments.findFirst({
      where: {
        Id: treatmentId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!treatment) return notFound("Hizmet bulunamadı.");

    return success({
      id: treatment.Id,
      name: treatment.Name,
      description: treatment.Description,
      durationMinutes: treatment.DurationMinutes,
      price: treatment.Price,
      color: treatment.Color,
    });
  } catch (error) {
    console.error("Get treatment error:", error);
    return serverError();
  }
}

/**
 * PUT /api/treatment/[id]
 * Update treatment (Owner/Admin only).
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await context.params;
    const treatmentId = parseInt(id);
    if (isNaN(treatmentId)) return fail("Geçersiz hizmet ID.", "VALIDATION_ERROR");

    const existing = await prisma.treatments.findFirst({
      where: {
        Id: treatmentId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!existing) return notFound("Hizmet bulunamadı.");

    const body = await req.json();
    const { name, description, durationMinutes, price, color } = body;

    const updated = await prisma.treatments.update({
      where: { Id: treatmentId },
      data: {
        ...(name !== undefined && { Name: name }),
        ...(description !== undefined && { Description: description }),
        ...(durationMinutes !== undefined && { DurationMinutes: durationMinutes }),
        ...(price !== undefined && { Price: price }),
        ...(color !== undefined && { Color: color }),
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(
      { id: updated.Id, name: updated.Name },
      "Hizmet başarıyla güncellendi."
    );
  } catch (error) {
    console.error("Update treatment error:", error);
    return serverError("Hizmet güncellenirken bir hata oluştu.");
  }
}

/**
 * DELETE /api/treatment/[id]
 * Soft delete treatment (Owner/Admin only).
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await context.params;
    const treatmentId = parseInt(id);
    if (isNaN(treatmentId)) return fail("Geçersiz hizmet ID.", "VALIDATION_ERROR");

    const existing = await prisma.treatments.findFirst({
      where: {
        Id: treatmentId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!existing) return notFound("Hizmet bulunamadı.");

    await prisma.treatments.update({
      where: { Id: treatmentId },
      data: {
        IsActive: false,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(null, "Hizmet başarıyla silindi.");
  } catch (error) {
    console.error("Delete treatment error:", error);
    return serverError("Hizmet silinirken bir hata oluştu.");
  }
}
