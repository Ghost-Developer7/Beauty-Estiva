import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

// SSE endpoint for real-time notifications (replaces SignalR)
export async function GET(req: NextRequest) {
  // Auth from cookie (EventSource can't send custom headers)
  const token = req.cookies.get("estiva-token")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  let userId: number;
  let tenantId: number;

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: "BeautyWiseAPI",
      audience: "BeautyWiseApp",
    });
    userId = Number(payload.sub);
    tenantId = Number(payload.tenantId);
  } catch {
    return new Response("Invalid token", { status: 401 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      let lastCheckTime = new Date();
      const sentIds = new Set<number>();

      const interval = setInterval(async () => {
        if (closed) {
          clearInterval(interval);
          return;
        }

        try {
          const newNotifications = await prisma.inAppNotifications.findMany({
            where: {
              TenantId: tenantId,
              OR: [{ UserId: userId }, { UserId: null }],
              IsActive: true,
              CDate: { gt: lastCheckTime },
            },
            orderBy: { CDate: "desc" },
            take: 10,
          });

          if (newNotifications.length > 0) {
            lastCheckTime = new Date();
            for (const n of newNotifications) {
              if (sentIds.has(n.Id)) continue;
              sentIds.add(n.Id);
              const event = {
                type: "ReceiveNotification",
                data: {
                  id: n.Id,
                  title: n.Title,
                  message: n.Message,
                  type: n.Type,
                  entityType: n.EntityType,
                  entityId: n.EntityId,
                  actionUrl: n.ActionUrl,
                  icon: n.Icon,
                  isRead: n.IsRead,
                  readAt: n.ReadAt?.toISOString() || null,
                  cDate: n.CDate?.toISOString() || null,
                },
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
              );
            }
          }

          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // Non-critical: poll failure doesn't break the stream
        }
      }, 5000);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
