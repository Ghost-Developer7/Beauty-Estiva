import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

// GET /api/notification/in-app/unread-count — Unread notification count
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const unreadCount = await prisma.inAppNotifications.count({
      where: {
        TenantId: user!.tenantId,
        IsActive: true,
        IsRead: false,
        OR: [{ UserId: user!.id }, { UserId: null }],
      },
    });

    return success({ unreadCount });
  } catch (error) {
    console.error("Unread count GET error:", error);
    return serverError();
  }
}
