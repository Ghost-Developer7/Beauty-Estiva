import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// PUT /api/tenantsettings/working-hours — Update working hours
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { workingHoursJson } = body;
    const now = new Date();

    await prisma.tenants.update({
      where: { Id: user!.tenantId },
      data: {
        WorkingHoursJson: JSON.stringify(workingHoursJson),
        UUser: user!.id,
        UDate: now,
      },
    });

    return success(null, "Çalışma saatleri güncellendi.");
  } catch (error) {
    console.error("Tenant working hours PUT error:", error);
    return serverError();
  }
}
