import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireAuth, requireRoles } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "settings") {
      const tenant = await prisma.tenants.findUnique({
        where: { Id: user!.tenantId },
        select: {
          ReminderHourBefore: true,
        },
      });
      return success(tenant);
    }

    if (action === "rules") {
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
    }

    if (action === "whatsapp") {
      const whatsapp = await prisma.tenantWhatsappIntegrations.findUnique({
        where: { TenantId: user!.tenantId },
      });

      return success(
        whatsapp
          ? {
              id: whatsapp.Id,
              hasToken: !!whatsapp.WhatsappApiToken,
              hasInstanceId: !!whatsapp.WhatsappInstanceId,
              isActive: whatsapp.IsActive,
            }
          : null
      );
    }

    return fail("action parametresi gereklidir (settings, rules, whatsapp)");
  } catch (error) {
    console.error("Notification settings GET error:", error);
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const now = new Date();

    // Update notification rules
    if (body.rules && Array.isArray(body.rules)) {
      for (const rule of body.rules) {
        const existing = await prisma.tenantNotificationRules.findFirst({
          where: { TenantId: user!.tenantId, Channel: rule.channel },
        });

        if (existing) {
          await prisma.tenantNotificationRules.update({
            where: { Id: existing.Id },
            data: {
              IsActive: rule.isActive,
              UUser: user!.id,
              UDate: now,
            },
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

        // Record history
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

    // Update reminder settings
    if (body.reminderHourBefore !== undefined) {
      await prisma.tenants.update({
        where: { Id: user!.tenantId },
        data: { ReminderHourBefore: body.reminderHourBefore },
      });
    }

    // Update whatsapp integration
    if (body.whatsapp) {
      const existing = await prisma.tenantWhatsappIntegrations.findUnique({
        where: { TenantId: user!.tenantId },
      });

      const whatsappData: any = {
        UUser: user!.id,
        UDate: now,
      };
      if (body.whatsapp.apiToken !== undefined) whatsappData.WhatsappApiToken = body.whatsapp.apiToken;
      if (body.whatsapp.instanceId !== undefined) whatsappData.WhatsappInstanceId = body.whatsapp.instanceId;
      if (body.whatsapp.isActive !== undefined) whatsappData.IsActive = body.whatsapp.isActive;

      if (existing) {
        await prisma.tenantWhatsappIntegrations.update({
          where: { TenantId: user!.tenantId },
          data: whatsappData,
        });
      } else {
        await prisma.tenantWhatsappIntegrations.create({
          data: {
            TenantId: user!.tenantId,
            WhatsappApiToken: body.whatsapp.apiToken || null,
            WhatsappInstanceId: body.whatsapp.instanceId || null,
            CUser: user!.id,
            CDate: now,
            IsActive: body.whatsapp.isActive ?? true,
          },
        });
      }
    }

    return success(null, "Bildirim ayarları güncellendi");
  } catch (error) {
    console.error("Notification settings PUT error:", error);
    return serverError();
  }
}
