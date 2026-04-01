import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/appointment/today — Get today's appointments
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const appointments = await prisma.appointments.findMany({
      where: {
        TenantId: user!.tenantId,
        IsActive: true,
        StartTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { StartTime: "asc" },
      include: {
        Customers: {
          select: { Id: true, Name: true, Surname: true, Phone: true },
        },
        Users: {
          select: { Id: true, Name: true, Surname: true },
        },
        Treatments: {
          select: { Id: true, Name: true, DurationMinutes: true, Price: true, Color: true },
        },
      },
    });

    return success(appointments);
  } catch (err) {
    console.error("Today appointments error:", err);
    return serverError();
  }
}
