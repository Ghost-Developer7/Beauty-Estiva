import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireAuth, requireRoles } from "@/lib/api-middleware";

// GET /api/notification/whatsapp — WhatsApp integration status
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

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
  } catch (error) {
    console.error("WhatsApp GET error:", error);
    return serverError();
  }
}

// PUT /api/notification/whatsapp — Update WhatsApp integration
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const now = new Date();

    const existing = await prisma.tenantWhatsappIntegrations.findUnique({
      where: { TenantId: user!.tenantId },
    });

    const whatsappData: any = { UUser: user!.id, UDate: now };
    if (body.apiToken !== undefined) whatsappData.WhatsappApiToken = body.apiToken;
    if (body.instanceId !== undefined) whatsappData.WhatsappInstanceId = body.instanceId;
    if (body.isActive !== undefined) whatsappData.IsActive = body.isActive;

    if (existing) {
      await prisma.tenantWhatsappIntegrations.update({
        where: { TenantId: user!.tenantId },
        data: whatsappData,
      });
    } else {
      await prisma.tenantWhatsappIntegrations.create({
        data: {
          TenantId: user!.tenantId,
          WhatsappApiToken: body.apiToken || null,
          WhatsappInstanceId: body.instanceId || null,
          CUser: user!.id,
          CDate: now,
          IsActive: body.isActive ?? true,
        },
      });
    }

    return success(null, "WhatsApp entegrasyonu güncellendi");
  } catch (error) {
    console.error("WhatsApp PUT error:", error);
    return serverError();
  }
}
