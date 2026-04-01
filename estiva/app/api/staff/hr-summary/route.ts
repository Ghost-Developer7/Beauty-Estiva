import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const staffMembers = await prisma.users.findMany({
      where: { TenantId: user!.tenantId, IsActive: true },
      select: {
        Id: true,
        Name: true,
        Surname: true,
        Email: true,
        PhoneNumber: true,
        BirthDate: true,
        CDate: true,
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
      const hrInfo = s.StaffHRInfos[0] || null;
      return {
        staffId: s.Id,
        name: s.Name,
        surname: s.Surname,
        email: s.Email,
        phone: s.PhoneNumber,
        birthDate: s.BirthDate,
        roles: s.UserRoles.map((ur) => ur.Roles.Name).filter(Boolean),
        hireDate: hrInfo?.HireDate || null,
        position: hrInfo?.Position || null,
        salary: hrInfo?.Salary || null,
        salaryCurrency: hrInfo?.SalaryCurrency || null,
        annualLeaveEntitlement: hrInfo?.AnnualLeaveEntitlement || 0,
        usedLeaveDays: hrInfo?.UsedLeaveDays || 0,
        remainingLeaveDays: hrInfo
          ? hrInfo.AnnualLeaveEntitlement - hrInfo.UsedLeaveDays
          : 0,
      };
    });

    return success(summary);
  } catch (error) {
    console.error("HR summary GET error:", error);
    return serverError();
  }
}
