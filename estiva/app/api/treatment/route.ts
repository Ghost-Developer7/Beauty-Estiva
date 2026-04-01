import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription, requireRoles } from "@/lib/api-middleware";
import { paginatedResponse, getPaginationParams } from "@/lib/pagination";

/**
 * GET /api/treatment
 * List treatments (auth required, subscription required).
 * Supports both flat array and paginated response.
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const hasPagination = searchParams.has("page") || searchParams.has("pageSize") || searchParams.has("pageNumber");

    const where = { TenantId: user!.tenantId, IsActive: true };
    const select = { Id: true, Name: true, Description: true, DurationMinutes: true, Price: true, Color: true };

    if (hasPagination) {
      const pageNum = parseInt(searchParams.get("pageNumber") || searchParams.get("page") || "1");
      const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
      const skip = (pageNum - 1) * pageSize;

      const [treatments, totalCount] = await Promise.all([
        prisma.treatments.findMany({ where, select, orderBy: { Name: "asc" }, skip, take: pageSize }),
        prisma.treatments.count({ where }),
      ]);

      const items = treatments.map((t) => ({
        id: t.Id, name: t.Name, description: t.Description,
        durationMinutes: t.DurationMinutes, price: t.Price ? Number(t.Price) : null, color: t.Color,
      }));

      return success(paginatedResponse(items, totalCount, pageNum, pageSize));
    }

    // No pagination - return flat array
    const treatments = await prisma.treatments.findMany({ where, select, orderBy: { Name: "asc" } });
    const items = treatments.map((t) => ({
      id: t.Id, name: t.Name, description: t.Description,
      durationMinutes: t.DurationMinutes, price: t.Price ? Number(t.Price) : null, color: t.Color,
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
