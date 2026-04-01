import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireAuth, requireRoles } from "@/lib/api-middleware";

/**
 * GET /api/branch
 * List branches (auth required).
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const branches = await prisma.branches.findMany({
      where: {
        TenantId: user!.tenantId,
        IsActive: true,
      },
      select: {
        Id: true,
        Name: true,
        Address: true,
        Phone: true,
        Email: true,
        WorkingHoursJson: true,
        IsMainBranch: true,
      },
      orderBy: [{ IsMainBranch: "desc" }, { Name: "asc" }],
    });

    const items = branches.map((b) => {
      let workingHours = null;
      try {
        workingHours = b.WorkingHoursJson ? JSON.parse(b.WorkingHoursJson) : null;
      } catch {
        workingHours = null;
      }

      return {
        id: b.Id,
        name: b.Name,
        address: b.Address,
        phone: b.Phone,
        email: b.Email,
        workingHours,
        isMainBranch: b.IsMainBranch,
      };
    });

    return success(items);
  } catch (error) {
    console.error("List branches error:", error);
    return serverError();
  }
}

/**
 * POST /api/branch
 * Create branch (Owner/Admin only).
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { name, address, phone, email, workingHoursJson, isMainBranch } = body;

    if (!name) {
      return fail("Şube adı zorunludur.", "VALIDATION_ERROR");
    }

    // If setting as main branch, unset the current main branch
    if (isMainBranch) {
      await prisma.branches.updateMany({
        where: {
          TenantId: user!.tenantId,
          IsMainBranch: true,
          IsActive: true,
        },
        data: {
          IsMainBranch: false,
          UUser: user!.id,
          UDate: new Date(),
        },
      });
    }

    const branch = await prisma.branches.create({
      data: {
        TenantId: user!.tenantId,
        Name: name,
        Address: address || null,
        Phone: phone || null,
        Email: email || null,
        WorkingHoursJson: workingHoursJson ? JSON.stringify(workingHoursJson) : null,
        IsMainBranch: isMainBranch || false,
        CUser: user!.id,
        CDate: new Date(),
        IsActive: true,
      },
    });

    return success(
      {
        id: branch.Id,
        name: branch.Name,
        isMainBranch: branch.IsMainBranch,
      },
      "Şube başarıyla oluşturuldu."
    );
  } catch (error) {
    console.error("Create branch error:", error);
    return serverError("Şube oluşturulurken bir hata oluştu.");
  }
}
