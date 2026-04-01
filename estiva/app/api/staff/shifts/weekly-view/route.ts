import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const staffMembers = await prisma.users.findMany({
      where: { TenantId: user!.tenantId, IsActive: true },
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

    const weeklyView = staffMembers.map((staff) => ({
      staffId: staff.Id,
      staffName: `${staff.Name} ${staff.Surname}`,
      shifts: staff.StaffShifts.map((s) => ({
        id: s.Id,
        dayOfWeek: s.DayOfWeek,
        startTime: s.StartTime,
        endTime: s.EndTime,
        breakStartTime: s.BreakStartTime,
        breakEndTime: s.BreakEndTime,
        isWorkingDay: s.IsWorkingDay,
      })),
    }));

    return success(weeklyView);
  } catch (error) {
    console.error("Weekly view GET error:", error);
    return serverError();
  }
}
