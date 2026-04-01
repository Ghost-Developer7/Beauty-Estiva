import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// PUT /api/tenantsettings/holidays — Update holidays
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { holidaysJson } = body;
    const now = new Date();

    await prisma.tenants.update({
      where: { Id: user!.tenantId },
      data: {
        HolidaysJson: JSON.stringify(holidaysJson),
        UUser: user!.id,
        UDate: now,
      },
    });

    return success(null, "Tatil günleri güncellendi.");
  } catch (error) {
    console.error("Tenant holidays PUT error:", error);
    return serverError();
  }
}
