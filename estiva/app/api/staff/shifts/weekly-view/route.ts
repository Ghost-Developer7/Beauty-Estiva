import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Auth, Response, RouteHandler, Guard } from "@/core/server";

/**
 * GET /api/staff/shifts/weekly-view
 * Returns every active staff member with their full 7-day shift schedule.
 * Restricted to Owner / Admin roles.
 */
export const GET = RouteHandler.wrap(
  "staff/shifts/weekly-view GET",
  async (req: NextRequest) => {
    const { user, error } = await Auth.requireRole(req, ["Owner", "Admin"]);
    if (error) return error;

    const staffMembers = await prisma.users.findMany({
      where: Guard.activeTenant(user.tenantId),
      select: {
        Id: true,
        Name: true,
        Surname: true,
        StaffShifts: {
          where: { IsActive: true },
          orderBy: { DayOfWeek: "asc" },
        },
      },
    });

    const weeklyView = staffMembers.map((member) => ({
      staffId: member.Id,
      staffFullName: `${member.Name} ${member.Surname}`,
      shifts: member.StaffShifts.map(mapShift),
    }));

    return Response.ok(weeklyView);
  },
);

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapShift(s: {
  Id: number;
  DayOfWeek: number;
  StartTime: Date;
  EndTime: Date;
  BreakStartTime: Date | null;
  BreakEndTime: Date | null;
  IsWorkingDay: boolean;
}) {
  return {
    id: s.Id,
    dayOfWeek: s.DayOfWeek,
    startTime: s.StartTime,
    endTime: s.EndTime,
    breakStartTime: s.BreakStartTime,
    breakEndTime: s.BreakEndTime,
    isWorkingDay: s.IsWorkingDay,
  };
}
