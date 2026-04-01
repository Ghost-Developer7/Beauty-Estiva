import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError, notFound } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ staffId: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { staffId } = await params;
    const staffIdNum = parseInt(staffId);
    if (isNaN(staffIdNum)) return fail("Geçersiz personel ID");

    const staff = await prisma.users.findFirst({
      where: { Id: staffIdNum, TenantId: user!.tenantId, IsActive: true },
      select: { Id: true, Name: true, Surname: true },
    });
    if (!staff) return notFound("Personel bulunamadı");

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const date = dateStr ? new Date(dateStr) : new Date();
    const dayOfWeek = date.getDay(); // 0=Sunday

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get shift for this day of week
    const shift = await prisma.staffShifts.findFirst({
      where: {
        StaffId: staffIdNum,
        TenantId: user!.tenantId,
        DayOfWeek: dayOfWeek,
        IsActive: true,
      },
    });

    // Get appointments for this day
    const appointments = await prisma.appointments.findMany({
      where: {
        StaffId: staffIdNum,
        TenantId: user!.tenantId,
        StartTime: { gte: startOfDay },
        EndTime: { lte: endOfDay },
        IsActive: true,
      },
      include: {
        Customers: { select: { Name: true, Surname: true } },
        Treatments: { select: { Name: true, DurationMinutes: true } },
      },
      orderBy: { StartTime: "asc" },
    });

    // Get unavailabilities for this day
    const unavailabilities = await prisma.staffUnavailabilities.findMany({
      where: {
        StaffId: staffIdNum,
        TenantId: user!.tenantId,
        StartTime: { lte: endOfDay },
        EndTime: { gte: startOfDay },
        IsActive: true,
      },
      orderBy: { StartTime: "asc" },
    });

    return success({
      staffId: staff.Id,
      staffName: `${staff.Name} ${staff.Surname}`,
      date: date.toISOString().split("T")[0],
      dayOfWeek,
      shift: shift
        ? {
            startTime: shift.StartTime,
            endTime: shift.EndTime,
            breakStartTime: shift.BreakStartTime,
            breakEndTime: shift.BreakEndTime,
            isWorkingDay: shift.IsWorkingDay,
          }
        : null,
      appointments: appointments.map((a) => ({
        id: a.Id,
        customerName: `${a.Customers.Name} ${a.Customers.Surname}`,
        treatmentName: a.Treatments.Name,
        durationMinutes: a.Treatments.DurationMinutes,
        startTime: a.StartTime,
        endTime: a.EndTime,
        status: a.Status,
        notes: a.Notes,
      })),
      unavailabilities: unavailabilities.map((u) => ({
        id: u.Id,
        startTime: u.StartTime,
        endTime: u.EndTime,
        reason: u.Reason,
        notes: u.Notes,
      })),
    });
  } catch (error) {
    console.error("Daily schedule GET error:", error);
    return serverError();
  }
}
