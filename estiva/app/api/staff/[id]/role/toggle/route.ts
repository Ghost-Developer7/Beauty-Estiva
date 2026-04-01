import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// POST /api/staff/[id]/role/toggle — Toggle staff approval
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRoles(req, ["Owner"]);
    if (error) return error;

    const { id } = await params;
    const staffId = parseInt(id);
    if (isNaN(staffId)) return fail("Geçersiz personel ID.", "VALIDATION_ERROR");

    const staff = await prisma.users.findFirst({
      where: { Id: staffId, TenantId: user!.tenantId, IsActive: true },
    });

    if (!staff) return notFound("Personel bulunamadı.");

    const newStatus = !staff.IsApproved;

    await prisma.users.update({
      where: { Id: staffId },
      data: {
        IsApproved: newStatus,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(
      { userId: staffId, isApproved: newStatus },
      newStatus ? "Personel onaylandı." : "Personel onayı kaldırıldı."
    );
  } catch (error) {
    console.error("Staff toggle approval error:", error);
    return serverError();
  }
}
