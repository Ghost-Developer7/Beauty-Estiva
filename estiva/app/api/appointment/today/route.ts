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

    const STATUS_MAP: Record<number, string> = {
      1: "Scheduled",
      2: "Confirmed",
      3: "Completed",
      4: "Cancelled",
      5: "NoShow",
    };

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

    const mapped = appointments.map((a) => ({
      id: a.Id,
      customerId: a.CustomerId,
      customerFullName: a.Customers ? `${a.Customers.Name} ${a.Customers.Surname}` : "",
      customerPhone: a.Customers?.Phone || "",
      staffId: a.StaffId,
      staffFullName: a.Users ? `${a.Users.Name} ${a.Users.Surname}` : "",
      treatmentId: a.TreatmentId,
      treatmentName: a.Treatments?.Name || "",
      treatmentColor: a.Treatments?.Color || null,
      durationMinutes: a.Treatments?.DurationMinutes || 0,
      startTime: a.StartTime,
      endTime: a.EndTime,
      status: STATUS_MAP[a.Status] || "Scheduled",
      notes: a.Notes,
      isRecurring: a.IsRecurring || false,
      sessionNumber: a.SessionNumber || 1,
      totalSessions: a.TotalSessions || null,
      parentAppointmentId: a.ParentAppointmentId || null,
    }));

    return success(mapped);
  } catch (err) {
    console.error("Today appointments error:", err);
    return serverError();
  }
}
