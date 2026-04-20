import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";
import {
  extractRequestedStaffRole,
  validateStaffRoleChange,
} from "@/lib/staff-role-guard";

// PUT /api/staff/[id]/role - Change staff role (Owner or SuperAdmin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await requireRoles(req, ["Owner"]);
    if (error) return error;

    const { id } = await params;
    const staffId = parseInt(id, 10);
    if (Number.isNaN(staffId)) {
      return fail("Geçersiz personel ID.", "VALIDATION_ERROR");
    }

    const staff = await prisma.users.findFirst({
      where: { Id: staffId, TenantId: user!.tenantId, IsActive: true },
      include: { UserRoles: { include: { Roles: true } } },
    });

    if (!staff) {
      return notFound("Personel bulunamadı.");
    }

    const body = await req.json();
    const requestedRole = extractRequestedStaffRole(body);
    const currentRoles = staff.UserRoles.map((userRole) => userRole.Roles.Name).filter(
      Boolean,
    ) as string[];

    const roleValidation = validateStaffRoleChange({
      actorUserId: user!.id,
      actorRoles: user!.roles,
      targetUserId: staffId,
      targetRoles: currentRoles,
      requestedRole,
    });

    if (!roleValidation.ok) {
      return fail(
        roleValidation.message,
        roleValidation.code,
        roleValidation.status,
      );
    }

    const newRole = await prisma.roles.findFirst({
      where: { NormalizedName: requestedRole.toUpperCase() },
    });

    if (!newRole) {
      return fail("Geçersiz rol.", "INVALID_ROLE");
    }

    const oldRoleName =
      staff.UserRoles.length > 0 && staff.UserRoles[0].Roles.Name
        ? staff.UserRoles[0].Roles.Name
        : "None";

    const tenant = await prisma.tenants.findFirst({
      where: { Id: user!.tenantId },
      select: { CompanyName: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.userRoles.deleteMany({ where: { UserId: staffId } });
      await tx.userRoles.create({ data: { UserId: staffId, RoleId: newRole.Id } });
      await tx.roleChangeAuditLogs.create({
        data: {
          TenantId: user!.tenantId,
          TargetUserId: staffId,
          PerformedByUserId: user!.id,
          ActionType: "RoleChange",
          OldRole: oldRoleName,
          NewRole: newRole.Name || requestedRole,
          TargetUserName: `${staff.Name} ${staff.Surname}`,
          PerformedByUserName: `${user!.name} ${user!.surname}`,
          TenantName: tenant?.CompanyName || "",
          CreatedAt: new Date(),
        },
      });
    });

    return success(
      { userId: staffId, newRole: newRole.Name },
      "Personel rolü başarıyla güncellendi.",
    );
  } catch (error) {
    console.error("Staff role PUT error:", error);
    return serverError();
  }
}
