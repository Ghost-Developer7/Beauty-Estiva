import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

// PATCH /api/notification/in-app/read-all — Mark all as read
export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const now = new Date();
    await prisma.inAppNotifications.updateMany({
      where: {
        TenantId: user!.tenantId,
        IsActive: true,
        IsRead: false,
        OR: [{ UserId: user!.id }, { UserId: null }],
      },
      data: { IsRead: true, ReadAt: now, UUser: user!.id, UDate: now },
    });

    return success(null, "Tüm bildirimler okundu olarak işaretlendi");
  } catch (error) {
    console.error("Read all notifications error:", error);
    return serverError();
  }
}
