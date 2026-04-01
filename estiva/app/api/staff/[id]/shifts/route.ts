import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError, notFound } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) return fail("Geçersiz personel ID");

    const staff = await prisma.users.findFirst({
      where: { Id: idNum, TenantId: user!.tenantId, IsActive: true },
      select: { Id: true, Name: true, Surname: true },
    });

    if (!staff) return notFound("Personel bulunamadı");

    const shifts = await prisma.staffShifts.findMany({
      where: {
        StaffId: idNum,
        TenantId: user!.tenantId,
        IsActive: true,
      },
      orderBy: { DayOfWeek: "asc" },
    });

    return success({
      staffName: `${staff.Name} ${staff.Surname}`,
      id: staff.Id,
      shifts: shifts.map((s) => ({
        id: s.Id,
        dayOfWeek: s.DayOfWeek,
        startTime: s.StartTime,
        endTime: s.EndTime,
        breakStartTime: s.BreakStartTime,
        breakEndTime: s.BreakEndTime,
        isWorkingDay: s.IsWorkingDay,
      })),
    });
  } catch (error) {
    console.error("Staff shifts GET error:", error);
    return serverError();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { id } = await params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) return fail("Geçersiz personel ID");

    const staff = await prisma.users.findFirst({
      where: { Id: idNum, TenantId: user!.tenantId, IsActive: true },
    });
    if (!staff) return notFound("Personel bulunamadı");

    const body = await req.json();
    const { shifts } = body;

    if (!Array.isArray(shifts)) {
      return fail("shifts alanı bir dizi olmalıdır");
    }

    // Delete old shifts for this staff
    await prisma.staffShifts.updateMany({
      where: {
        StaffId: idNum,
        TenantId: user!.tenantId,
        IsActive: true,
      },
      data: { IsActive: false, UUser: user!.id, UDate: new Date() },
    });

    // Create new shifts
    const now = new Date();
    const createdShifts = await Promise.all(
      shifts.map((shift: any) =>
        prisma.staffShifts.create({
          data: {
            TenantId: user!.tenantId,
            StaffId: idNum,
            DayOfWeek: shift.dayOfWeek,
            StartTime: new Date(shift.startTime),
            EndTime: new Date(shift.endTime),
            BreakStartTime: shift.breakStartTime
              ? new Date(shift.breakStartTime)
              : null,
            BreakEndTime: shift.breakEndTime
              ? new Date(shift.breakEndTime)
              : null,
            IsWorkingDay: shift.isWorkingDay ?? true,
            CUser: user!.id,
            CDate: now,
            IsActive: true,
          },
        })
      )
    );

    return success(createdShifts, "Vardiyalar güncellendi");
  } catch (error) {
    console.error("Staff shifts PUT error:", error);
    return serverError();
  }
}
