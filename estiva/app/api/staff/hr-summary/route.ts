import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Auth, Response, RouteHandler, Guard } from "@/core/server";

/**
 * GET /api/staff/hr-summary
 * Returns a lightweight HR overview for every active staff member.
 * Includes roles, position, salary, hire date, and leave balance.
 * Restricted to Owner / Admin roles.
 */
export const GET = RouteHandler.wrap(
  "staff/hr-summary GET",
  async (req: NextRequest) => {
    const { user, error } = await Auth.requireRole(req, ["Owner", "Admin"]);
    if (error) return error;

    const staffMembers = await prisma.users.findMany({
      where: Guard.activeTenant(user.tenantId),
      select: {
        Id: true,
        Name: true,
        Surname: true,
        StaffHRInfos: {
          where: { IsActive: true },
          select: {
            HireDate: true,
            Position: true,
            Salary: true,
            SalaryCurrency: true,
            AnnualLeaveEntitlement: true,
            UsedLeaveDays: true,
          },
        },
        UserRoles: {
          include: { Roles: { select: { Name: true } } },
        },
      },
    });

    const summary = staffMembers.map((s) => {
      const hrInfo = s.StaffHRInfos[0] ?? null;
      return {
        staffId: s.Id,
        staffFullName: `${s.Name} ${s.Surname}`,
        roles: s.UserRoles.map((ur) => ur.Roles.Name).filter(Boolean),
        hireDate: hrInfo?.HireDate ?? null,
        position: hrInfo?.Position ?? null,
        salary: hrInfo?.Salary ?? null,
        salaryCurrency: hrInfo?.SalaryCurrency ?? "TRY",
        annualLeaveEntitlement: hrInfo?.AnnualLeaveEntitlement ?? 0,
        usedLeaveDays: hrInfo?.UsedLeaveDays ?? 0,
        remainingLeaveDays: hrInfo
          ? hrInfo.AnnualLeaveEntitlement - hrInfo.UsedLeaveDays
          : 0,
      };
    });

    return Response.ok(summary);
  },
);
