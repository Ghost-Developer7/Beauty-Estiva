import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError, notFound } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";
import { getPaginationParams, paginatedResponse } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get("countOnly");

    if (countOnly === "true") {
      const unreadCount = await prisma.inAppNotifications.count({
        where: {
          TenantId: user!.tenantId,
          IsActive: true,
          IsRead: false,
          OR: [{ UserId: user!.id }, { UserId: null }],
        },
      });
      return success({ unreadCount });
    }

    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const where = {
      TenantId: user!.tenantId,
      IsActive: true,
      OR: [{ UserId: user!.id }, { UserId: null }],
    };

    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.inAppNotifications.findMany({
        where,
        orderBy: { CDate: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.inAppNotifications.count({ where }),
      prisma.inAppNotifications.count({
        where: { ...where, IsRead: false },
      }),
    ]);

    const items = notifications.map((n) => ({
      id: n.Id,
      title: n.Title,
      message: n.Message,
      type: n.Type,
      entityType: n.EntityType,
      entityId: n.EntityId,
      isRead: n.IsRead,
      readAt: n.ReadAt,
      actionUrl: n.ActionUrl,
      icon: n.Icon,
      cDate: n.CDate,
    }));

    return success({
      ...paginatedResponse(items, totalCount, page, pageSize),
      unreadCount,
    });
  } catch (error) {
    console.error("In-app notifications GET error:", error);
    return serverError();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const now = new Date();

    if (body.all === true) {
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
    }

    if (body.id) {
      const notification = await prisma.inAppNotifications.findFirst({
        where: {
          Id: body.id,
          TenantId: user!.tenantId,
          IsActive: true,
          OR: [{ UserId: user!.id }, { UserId: null }],
        },
      });
      if (!notification) return notFound("Bildirim bulunamadı");

      await prisma.inAppNotifications.update({
        where: { Id: body.id },
        data: { IsRead: true, ReadAt: now, UUser: user!.id, UDate: now },
      });
      return success(null, "Bildirim okundu olarak işaretlendi");
    }

    return fail("id veya all parametresi gereklidir");
  } catch (error) {
    console.error("In-app notifications PATCH error:", error);
    return serverError();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return fail("id parametresi gereklidir");

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
    console.error("In-app notifications DELETE error:", error);
    return serverError();
  }
}
