import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireAuth, requireRoles } from "@/lib/api-middleware";

// GET /api/notification/rules — Notification rules per channel
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const rules = await prisma.tenantNotificationRules.findMany({
      where: { TenantId: user!.tenantId },
    });

    const preferences = await prisma.userNotificationPreferences.findMany({
      where: { AppUserId: user!.id, IsActive: true },
    });

    return success({
      tenantRules: rules.map((r) => ({
        id: r.Id,
        channel: r.Channel,
        isActive: r.IsActive,
      })),
      userPreferences: preferences.map((p) => ({
        id: p.Id,
        channel: p.Channel,
        isEnabled: p.IsEnabled,
      })),
    });
  } catch (error) {
    console.error("Notification rules GET error:", error);
    return serverError();
  }
}

// PUT /api/notification/rules — Update notification rules
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const now = new Date();

    if (body.rules && Array.isArray(body.rules)) {
      for (const rule of body.rules) {
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

        await prisma.tenantNotificationHistories.create({
          data: {
            TenantId: user!.tenantId,
            ChangedByUserId: user!.id,
            Channel: rule.channel,
            OldValue: existing?.IsActive ?? false,
            NewValue: rule.isActive,
            ChangeDate: now,
          },
        });
      }
    }

    return success(null, "Bildirim kuralları güncellendi");
  } catch (error) {
    console.error("Notification rules PUT error:", error);
    return serverError();
  }
}
