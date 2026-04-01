import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireAuth, requireRoles } from "@/lib/api-middleware";

// GET /api/notification/settings — Tenant notification settings
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const tenant = await prisma.tenants.findUnique({
      where: { Id: user!.tenantId },
      select: {
        ReminderHourBefore: true,
      },
    });

    return success(tenant);
  } catch (error) {
    console.error("Notification settings GET error:", error);
    return serverError();
  }
}

// PUT /api/notification/settings — Update tenant notification settings
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const now = new Date();

    if (body.reminderHourBefore !== undefined) {
      await prisma.tenants.update({
        where: { Id: user!.tenantId },
        data: { ReminderHourBefore: body.reminderHourBefore },
      });
    }

    return success(null, "Bildirim ayarları güncellendi");
  } catch (error) {
    console.error("Notification settings PUT error:", error);
    return serverError();
  }
}
