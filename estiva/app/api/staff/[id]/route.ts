import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/staff/[id]
 * Get staff detail.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin", "Staff"]);
    if (error) return error;

    const { id } = await context.params;
    const staffId = parseInt(id);
    if (isNaN(staffId)) return fail("Geçersiz personel ID.", "VALIDATION_ERROR");

    const staff = await prisma.users.findFirst({
      where: {
        Id: staffId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
      select: {
        Id: true,
        Name: true,
        Surname: true,
        Email: true,
        PhoneNumber: true,
        BirthDate: true,
        IsApproved: true,
        ProfilePicturePath: true,
        DefaultCommissionRate: true,
        BranchId: true,
        CDate: true,
        UserRoles: {
          select: {
            Roles: {
              select: { Id: true, Name: true },
            },
          },
        },
        Branches: {
          select: { Id: true, Name: true },
        },
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
          take: 1,
        },
      },
    });

    if (!staff) return notFound("Personel bulunamadı.");

    const hrInfo = staff.StaffHRInfos.length > 0 ? staff.StaffHRInfos[0] : null;

    return success({
      id: staff.Id,
      name: staff.Name,
      surname: staff.Surname,
      email: staff.Email,
      phone: staff.PhoneNumber,
      birthDate: staff.BirthDate,
      isApproved: staff.IsApproved,
      profilePicture: staff.ProfilePicturePath,
      defaultCommissionRate: staff.DefaultCommissionRate,
      branch: staff.Branches ? { id: staff.Branches.Id, name: staff.Branches.Name } : null,
      roles: staff.UserRoles.map((ur) => ({
        id: ur.Roles.Id,
        name: ur.Roles.Name,
      })),
      joinedDate: staff.CDate,
      hrInfo: hrInfo
        ? {
            hireDate: hrInfo.HireDate,
            position: hrInfo.Position,
            salary: hrInfo.Salary,
            salaryCurrency: hrInfo.SalaryCurrency,
            annualLeaveEntitlement: hrInfo.AnnualLeaveEntitlement,
            usedLeaveDays: hrInfo.UsedLeaveDays,
          }
        : null,
    });
  } catch (error) {
    console.error("Get staff detail error:", error);
    return serverError();
  }
}

/**
 * PUT /api/staff/[id]
 * Update staff role (Owner only).
 * Body: { role }
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireRoles(req, ["Owner"]);
    if (error) return error;

    const { id } = await context.params;
    const staffId = parseInt(id);
    if (isNaN(staffId)) return fail("Geçersiz personel ID.", "VALIDATION_ERROR");

    const staff = await prisma.users.findFirst({
      where: {
        Id: staffId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
      include: {
        UserRoles: {
          include: {
            Roles: true,
          },
        },
      },
    });

    if (!staff) return notFound("Personel bulunamadı.");

    const body = await req.json();
    const { role } = body;

    if (!role) {
      return fail("Rol alanı zorunludur.", "VALIDATION_ERROR");
    }

    // Find or validate the new role
    const newRole = await prisma.roles.findFirst({
      where: { NormalizedName: role.toUpperCase() },
    });

    if (!newRole) {
      return fail("Geçersiz rol.", "INVALID_ROLE");
    }

    // Get old role name for audit log
    const oldRoleName =
      staff.UserRoles.length > 0 && staff.UserRoles[0].Roles.Name
        ? staff.UserRoles[0].Roles.Name
        : "None";

    // Get tenant name for audit log
    const tenant = await prisma.tenants.findFirst({
      where: { Id: user!.tenantId },
      select: { CompanyName: true },
    });

    await prisma.$transaction(async (tx) => {
      // Remove old UserRoles
      await tx.userRoles.deleteMany({
        where: { UserId: staffId },
      });

      // Add new role
      await tx.userRoles.create({
        data: {
          UserId: staffId,
          RoleId: newRole.Id,
        },
      });

      // Create RoleChangeAuditLog
      await tx.roleChangeAuditLogs.create({
        data: {
          TenantId: user!.tenantId,
          TargetUserId: staffId,
          PerformedByUserId: user!.id,
          ActionType: "RoleChange",
          OldRole: oldRoleName,
          NewRole: newRole.Name || role,
          TargetUserName: `${staff.Name} ${staff.Surname}`,
          PerformedByUserName: `${user!.name} ${user!.surname}`,
          TenantName: tenant?.CompanyName || "",
          CreatedAt: new Date(),
        },
      });
    });

    return success(
      { userId: staffId, newRole: newRole.Name },
      "Personel rolü başarıyla güncellendi."
    );
  } catch (error) {
    console.error("Update staff role error:", error);
    return serverError("Personel rolü güncellenirken bir hata oluştu.");
  }
}
