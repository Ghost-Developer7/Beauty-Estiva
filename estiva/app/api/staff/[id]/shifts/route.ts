import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Auth, Response, RouteHandler, Guard } from "@/core/server";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/staff/:id/shifts
 * Returns the weekly shift schedule for a single staff member.
 * Accessible by the staff member themselves or Owner / Admin.
 */
export const GET = RouteHandler.wrap(
  "staff/[id]/shifts GET",
  async (req: NextRequest, { params }: Ctx) => {
    const { user, error } = await Auth.requireSubscription(req);
    if (error) return error;

    const { id } = await params;
    const staffId = Guard.parseId(id);
    if (!staffId) return Response.badRequest("Invalid staff ID");

    const staff = await prisma.users.findFirst({
      where: { Id: staffId, ...Guard.activeTenant(user.tenantId) },
    });
    if (!staff) return Response.notFound("Staff member not found");

    const shifts = await prisma.staffShifts.findMany({
      where: { StaffId: staffId, ...Guard.activeTenant(user.tenantId) },
      orderBy: { DayOfWeek: "asc" },
    });

    return Response.ok(
      shifts.map((s) => ({
        id: s.Id,
        dayOfWeek: s.DayOfWeek,
        startTime: s.StartTime,
        endTime: s.EndTime,
        breakStartTime: s.BreakStartTime,
        breakEndTime: s.BreakEndTime,
        isWorkingDay: s.IsWorkingDay,
      })),
    );
  },
);

/**
 * PUT /api/staff/:id/shifts
 * Replace the full weekly shift schedule for a staff member.
 * Restricted to Owner / Admin roles.
 */
export const PUT = RouteHandler.wrap(
  "staff/[id]/shifts PUT",
  async (req: NextRequest, { params }: Ctx) => {
    const { user, error } = await Auth.requireRole(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const staffId = Guard.parseId(id);
    if (!staffId) return Response.badRequest("Invalid staff ID");

    const staff = await prisma.users.findFirst({
      where: { Id: staffId, ...Guard.activeTenant(user.tenantId) },
    });
    if (!staff) return Response.notFound("Staff member not found");

    const body = await req.json();
    if (!Array.isArray(body.shifts)) {
      return Response.badRequest("'shifts' must be an array");
    }

    // Soft-delete existing shifts before inserting the new set
    await prisma.staffShifts.updateMany({
      where: { StaffId: staffId, ...Guard.activeTenant(user.tenantId) },
      data: Guard.softDelete(user.id),
    });

    const now = new Date();
    await prisma.staffShifts.createMany({
      data: body.shifts.map((shift: any) => ({
        TenantId: user.tenantId,
        StaffId: staffId,
        DayOfWeek: shift.dayOfWeek,
        StartTime: new Date(shift.startTime),
        EndTime: new Date(shift.endTime),
        BreakStartTime: shift.breakStartTime ? new Date(shift.breakStartTime) : null,
        BreakEndTime: shift.breakEndTime ? new Date(shift.breakEndTime) : null,
        IsWorkingDay: shift.isWorkingDay ?? true,
        CUser: user.id,
        CDate: now,
        IsActive: true,
      })),
    });

    return Response.ok(null, "Shifts updated successfully");
  },
);
