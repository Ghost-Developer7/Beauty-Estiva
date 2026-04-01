import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// PUT /api/staff/leaves/[id]/approve — Approve leave request
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const leaveId = parseInt(id);
    if (isNaN(leaveId)) return fail("Geçersiz izin ID.");

    const leave = await prisma.staffLeaves.findFirst({
      where: { Id: leaveId, TenantId: user!.tenantId, IsActive: true },
    });

    if (!leave) return notFound("İzin talebi bulunamadı.");

    if (leave.Status !== "Pending") {
      return fail("Sadece bekleyen talepler onaylanabilir.");
    }

    const now = new Date();
    await prisma.staffLeaves.update({
      where: { Id: leaveId },
      data: {
        Status: "Approved",
        ApprovedById: user!.id,
        ApprovedDate: now,
        UUser: user!.id,
        UDate: now,
      },
    });

    return success(null, "İzin talebi onaylandı.");
  } catch (error) {
    console.error("Leave approve error:", error);
    return serverError();
  }
}
