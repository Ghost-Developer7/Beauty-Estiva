import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireAuth, requireRoles } from "@/lib/api-middleware";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/branch/[id]
 * Get branch detail with assigned staff.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { id } = await context.params;
    const branchId = parseInt(id);
    if (isNaN(branchId)) return fail("Geçersiz şube ID.", "VALIDATION_ERROR");

    const branch = await prisma.branches.findFirst({
      where: {
        Id: branchId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
      include: {
        Users: {
          where: { IsActive: true },
          select: {
            Id: true,
            Name: true,
            Surname: true,
            Email: true,
            PhoneNumber: true,
            UserRoles: {
              select: {
                Roles: {
                  select: { Name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!branch) return notFound("Şube bulunamadı.");

    let workingHours = null;
    try {
      workingHours = branch.WorkingHoursJson ? JSON.parse(branch.WorkingHoursJson) : null;
    } catch {
      workingHours = null;
    }

    return success({
      id: branch.Id,
      name: branch.Name,
      address: branch.Address,
      phone: branch.Phone,
      email: branch.Email,
      workingHours,
      isMainBranch: branch.IsMainBranch,
      staff: branch.Users.map((s) => ({
        id: s.Id,
        name: s.Name,
        surname: s.Surname,
        email: s.Email,
        phone: s.PhoneNumber,
        roles: s.UserRoles.map((ur) => ur.Roles.Name),
      })),
    });
  } catch (error) {
    console.error("Get branch detail error:", error);
    return serverError();
  }
}

/**
 * PUT /api/branch/[id]
 * Update branch (Owner/Admin only).
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await context.params;
    const branchId = parseInt(id);
    if (isNaN(branchId)) return fail("Geçersiz şube ID.", "VALIDATION_ERROR");

    const existing = await prisma.branches.findFirst({
      where: {
        Id: branchId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!existing) return notFound("Şube bulunamadı.");

    const body = await req.json();
    const { name, address, phone, email, workingHoursJson, isMainBranch, assignStaffIds } = body;

    // If setting as main branch, unset current main
    if (isMainBranch && !existing.IsMainBranch) {
      await prisma.branches.updateMany({
        where: {
          TenantId: user!.tenantId,
          IsMainBranch: true,
          IsActive: true,
          Id: { not: branchId },
        },
        data: {
          IsMainBranch: false,
          UUser: user!.id,
          UDate: new Date(),
        },
      });
    }

    await prisma.branches.update({
      where: { Id: branchId },
      data: {
        ...(name !== undefined && { Name: name }),
        ...(address !== undefined && { Address: address }),
        ...(phone !== undefined && { Phone: phone }),
        ...(email !== undefined && { Email: email }),
        ...(workingHoursJson !== undefined && {
          WorkingHoursJson: workingHoursJson ? JSON.stringify(workingHoursJson) : null,
        }),
        ...(isMainBranch !== undefined && { IsMainBranch: isMainBranch }),
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    // Handle staff assignment if provided
    if (Array.isArray(assignStaffIds)) {
      // Assign staff to this branch
      await prisma.users.updateMany({
        where: {
          Id: { in: assignStaffIds },
          TenantId: user!.tenantId,
          IsActive: true,
        },
        data: {
          BranchId: branchId,
          UUser: user!.id,
          UDate: new Date(),
        },
      });
    }

    return success(null, "Şube başarıyla güncellendi.");
  } catch (error) {
    console.error("Update branch error:", error);
    return serverError("Şube güncellenirken bir hata oluştu.");
  }
}

/**
 * DELETE /api/branch/[id]
 * Soft delete branch (Owner/Admin only).
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await context.params;
    const branchId = parseInt(id);
    if (isNaN(branchId)) return fail("Geçersiz şube ID.", "VALIDATION_ERROR");

    const existing = await prisma.branches.findFirst({
      where: {
        Id: branchId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!existing) return notFound("Şube bulunamadı.");

    if (existing.IsMainBranch) {
      return fail("Ana şube silinemez.", "MAIN_BRANCH_DELETE");
    }

    await prisma.$transaction(async (tx) => {
      // Unassign staff from this branch
      await tx.users.updateMany({
        where: {
          BranchId: branchId,
          TenantId: user!.tenantId,
          IsActive: true,
        },
        data: {
          BranchId: null,
          UUser: user!.id,
          UDate: new Date(),
        },
      });

      // Soft delete branch
      await tx.branches.update({
        where: { Id: branchId },
        data: {
          IsActive: false,
          UUser: user!.id,
          UDate: new Date(),
        },
      });
    });

    return success(null, "Şube başarıyla silindi.");
  } catch (error) {
    console.error("Delete branch error:", error);
    return serverError("Şube silinirken bir hata oluştu.");
  }
}
