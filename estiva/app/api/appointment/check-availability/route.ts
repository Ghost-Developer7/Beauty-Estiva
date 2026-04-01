import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// POST /api/appointment/check-availability — Check staff availability
export async function POST(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { staffId, startTime, endTime } = body;

    if (!staffId || !startTime || !endTime) {
      return fail("staffId, startTime ve endTime zorunludur.");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const conflicts: Array<{ type: string; detail: string }> = [];

    // 1. Check existing appointment overlaps
    const overlappingAppointments = await prisma.appointments.findMany({
      where: {
        TenantId: user!.tenantId,
        StaffId: staffId,
        IsActive: true,
        Status: { not: 4 }, // Not cancelled
        StartTime: { lt: end },
        EndTime: { gt: start },
      },
      select: {
        Id: true,
        StartTime: true,
        EndTime: true,
        Status: true,
        Customers: { select: { Name: true, Surname: true } },
        Treatments: { select: { Name: true } },
      },
    });

    for (const apt of overlappingAppointments) {
      conflicts.push({
        type: "appointment",
        detail: `Randevu #${apt.Id}: ${apt.Customers.Name} ${apt.Customers.Surname} - ${apt.Treatments.Name} (${apt.StartTime.toISOString()} - ${apt.EndTime.toISOString()})`,
      });
    }

    // 2. Check StaffUnavailabilities
    const unavailabilities = await prisma.staffUnavailabilities.findMany({
      where: {
        TenantId: user!.tenantId,
        StaffId: staffId,
        IsActive: true,
        StartTime: { lt: end },
        EndTime: { gt: start },
      },
      select: { Id: true, StartTime: true, EndTime: true, Reason: true },
    });

    for (const ua of unavailabilities) {
      conflicts.push({
        type: "unavailability",
        detail: `Müsait değil: ${ua.Reason} (${ua.StartTime.toISOString()} - ${ua.EndTime.toISOString()})`,
      });
    }

    // 3. Check StaffShifts for the day
    const dayOfWeek = start.getDay(); // 0=Sunday, 1=Monday, ...
    const shift = await prisma.staffShifts.findFirst({
      where: {
        TenantId: user!.tenantId,
        StaffId: staffId,
        DayOfWeek: dayOfWeek,
        IsActive: true,
      },
    });

    if (!shift) {
      conflicts.push({
        type: "no_shift",
        detail: "Bu gün için tanımlı vardiya bulunmuyor.",
      });
    } else if (!shift.IsWorkingDay) {
      conflicts.push({
        type: "day_off",
        detail: "Bu gün çalışma günü değil.",
      });
    }

    const available = conflicts.length === 0;

    return success({ available, conflicts });
  } catch (err) {
    console.error("Check availability error:", err);
    return serverError();
  }
}
