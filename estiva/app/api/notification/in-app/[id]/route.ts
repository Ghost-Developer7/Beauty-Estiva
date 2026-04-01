import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

// PATCH /api/notification/in-app/[id] — Mark one as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) return fail("Geçersiz bildirim ID");

    const notification = await prisma.inAppNotifications.findFirst({
      where: {
        Id: notificationId,
        TenantId: user!.tenantId,
        IsActive: true,
        OR: [{ UserId: user!.id }, { UserId: null }],
      },
    });

    if (!notification) return notFound("Bildirim bulunamadı");

    const now = new Date();
    await prisma.inAppNotifications.update({
      where: { Id: notificationId },
      data: { IsRead: true, ReadAt: now, UUser: user!.id, UDate: now },
    });

    return success(null, "Bildirim okundu olarak işaretlendi");
  } catch (error) {
    console.error("Mark notification read error:", error);
    return serverError();
  }
}

// DELETE /api/notification/in-app/[id] — Delete one notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) return fail("Geçersiz bildirim ID");

    const notification = await prisma.inAppNotifications.findFirst({
      where: {
        Id: notificationId,
        TenantId: user!.tenantId,
        IsActive: true,
        OR: [{ UserId: user!.id }, { UserId: null }],
      },
    });

    if (!notification) return notFound("Bildirim bulunamadı");

    await prisma.inAppNotifications.update({
      where: { Id: notificationId },
      data: { IsActive: false, UUser: user!.id, UDate: new Date() },
    });

    return success(null, "Bildirim silindi");
  } catch (error) {
    console.error("Delete notification error:", error);
    return serverError();
  }
}
