import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// PUT /api/tenantsettings/notification-settings — Update notification rules
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { rules } = body;

    if (!Array.isArray(rules)) {
      return fail("Rules bir dizi olmalıdır.", "VALIDATION_ERROR");
    }

    const now = new Date();

    for (const rule of rules) {
      const existing = await prisma.tenantNotificationRules.findFirst({
        where: { TenantId: user!.tenantId, Channel: rule.channel },
      });

      if (existing) {
        await prisma.tenantNotificationRules.update({
          where: { Id: existing.Id },
          data: { IsActive: rule.isActive, UUser: user!.id, UDate: now },
        });
      } else {
        await prisma.tenantNotificationRules.create({
          data: {
            TenantId: user!.tenantId,
            Channel: rule.channel,
            IsActive: rule.isActive,
            CUser: user!.id,
            CDate: now,
          },
        });
      }
    }

    return success(null, "Bildirim ayarları güncellendi.");
  } catch (error) {
    console.error("Tenant notification settings PUT error:", error);
    return serverError();
  }
}
