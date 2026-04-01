import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// POST /api/branch/[id]/assign-staff — Assign staff to branch
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const branchId = parseInt(id);
    if (isNaN(branchId)) return fail("Geçersiz şube ID.", "VALIDATION_ERROR");

    const branch = await prisma.branches.findFirst({
      where: { Id: branchId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!branch) return notFound("Şube bulunamadı.");

    const body = await req.json();
    const { staffId } = body;

    if (!staffId) return fail("staffId zorunludur.");

    const staff = await prisma.users.findFirst({
      where: { Id: staffId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!staff) return notFound("Personel bulunamadı.");

    await prisma.users.update({
      where: { Id: staffId },
      data: {
        BranchId: branchId,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(
      { staffId, branchId },
      "Personel şubeye atandı."
    );
  } catch (error) {
    console.error("Branch assign staff error:", error);
    return serverError();
  }
}
