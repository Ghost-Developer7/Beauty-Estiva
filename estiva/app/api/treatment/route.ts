import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription, requireRoles } from "@/lib/api-middleware";

/**
 * GET /api/treatment
 * List treatments (auth required, subscription required).
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const treatments = await prisma.treatments.findMany({
      where: {
        TenantId: user!.tenantId,
        IsActive: true,
      },
      select: {
        Id: true,
        Name: true,
        Description: true,
        DurationMinutes: true,
        Price: true,
        Color: true,
      },
      orderBy: { Name: "asc" },
    });

    const items = treatments.map((t) => ({
      id: t.Id,
      name: t.Name,
      description: t.Description,
      durationMinutes: t.DurationMinutes,
      price: t.Price,
      color: t.Color,
    }));

    return success(items);
  } catch (error) {
    console.error("List treatments error:", error);
    return serverError();
  }
}

/**
 * POST /api/treatment
 * Create treatment (Owner/Admin only).
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { name, description, durationMinutes, price, color } = body;

    if (!name || !durationMinutes) {
      return fail("Ad ve süre zorunludur.", "VALIDATION_ERROR");
    }

    const treatment = await prisma.treatments.create({
      data: {
        TenantId: user!.tenantId,
        Name: name,
        Description: description || null,
        DurationMinutes: durationMinutes,
        Price: price ?? null,
        Color: color || null,
        CUser: user!.id,
        CDate: new Date(),
        IsActive: true,
      },
    });

    return success(
      {
        id: treatment.Id,
        name: treatment.Name,
        durationMinutes: treatment.DurationMinutes,
        price: treatment.Price,
        color: treatment.Color,
      },
      "Hizmet başarıyla oluşturuldu."
    );
  } catch (error) {
    console.error("Create treatment error:", error);
    return serverError("Hizmet oluşturulurken bir hata oluştu.");
  }
}
