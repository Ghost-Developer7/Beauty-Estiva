import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError, notFound } from "@/lib/api-response";
import { requireSubscription, requireRoles } from "@/lib/api-middleware";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const leaveId = parseInt(id);
    if (isNaN(leaveId)) return fail("Geçersiz izin ID");

    const leave = await prisma.staffLeaves.findFirst({
      where: { Id: leaveId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!leave) return notFound("İzin talebi bulunamadı");

    const body = await req.json();
    const { action } = body;

    if (action !== "approve" && action !== "reject") {
      return fail("action 'approve' veya 'reject' olmalıdır");
    }

    const newStatus = action === "approve" ? "Approved" : "Rejected";
    const now = new Date();

    const updated = await prisma.staffLeaves.update({
      where: { Id: leaveId },
      data: {
        Status: newStatus,
        ApprovedById: user!.id,
        ApprovedDate: now,
        UUser: user!.id,
        UDate: now,
      },
    });

    // If approved, update UsedLeaveDays in StaffHRInfos
    if (action === "approve") {
      const startDate = new Date(leave.StartDate);
      const endDate = new Date(leave.EndDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      await prisma.staffHRInfos.updateMany({
        where: {
          StaffId: leave.StaffId,
          TenantId: user!.tenantId,
          IsActive: true,
        },
        data: {
          UsedLeaveDays: { increment: diffDays },
          UUser: user!.id,
          UDate: now,
        },
      });
    }

    return success(updated, `İzin talebi ${newStatus === "Approved" ? "onaylandı" : "reddedildi"}`);
  } catch (error) {
    console.error("Staff leave PUT error:", error);
    return serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { id } = await params;
    const leaveId = parseInt(id);
    if (isNaN(leaveId)) return fail("Geçersiz izin ID");

    const leave = await prisma.staffLeaves.findFirst({
      where: { Id: leaveId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!leave) return notFound("İzin talebi bulunamadı");

    await prisma.staffLeaves.update({
      where: { Id: leaveId },
      data: { IsActive: false, UUser: user!.id, UDate: new Date() },
    });

    return success(null, "İzin talebi silindi");
  } catch (error) {
    console.error("Staff leave DELETE error:", error);
    return serverError();
  }
}
