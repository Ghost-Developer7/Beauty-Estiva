import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Auth, Response, RouteHandler, Guard, DateRange } from "@/core/server";

/**
 * GET /api/staff/leaves/balances
 * Returns leave balance for every staff member, including pending days.
 * Accessible by any authenticated subscriber (staff see their own via UI filtering).
 */
export const GET = RouteHandler.wrap(
  "staff/leaves/balances GET",
  async (req: NextRequest) => {
    const { user, error } = await Auth.requireSubscription(req);
    if (error) return error;

    const [hrInfos, pendingLeaves] = await Promise.all([
      prisma.staffHRInfos.findMany({
        where: Guard.activeTenant(user.tenantId),
        include: {
          Users: { select: { Name: true, Surname: true } },
        },
      }),
      prisma.staffLeaves.findMany({
        where: { ...Guard.activeTenant(user.tenantId), Status: "Pending" },
        select: { StaffId: true, StartDate: true, EndDate: true },
      }),
    ]);

    // Aggregate pending leave days per staff member
    const pendingByStaff = pendingLeaves.reduce<Record<number, number>>(
      (acc, leave) => {
        const days = DateRange.daysBetween(leave.StartDate, leave.EndDate);
        acc[leave.StaffId] = (acc[leave.StaffId] ?? 0) + days;
        return acc;
      },
      {},
    );

    const balances = hrInfos.map((hr) => ({
      staffId: hr.StaffId,
      staffFullName: `${hr.Users.Name} ${hr.Users.Surname}`,
      annualEntitlement: hr.AnnualLeaveEntitlement,
      usedDays: hr.UsedLeaveDays,
      pendingDays: pendingByStaff[hr.StaffId] ?? 0,
      remainingDays: hr.AnnualLeaveEntitlement - hr.UsedLeaveDays,
    }));

    return Response.ok(balances);
  },
);
