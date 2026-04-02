import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Auth, Response, RouteHandler, Guard, DateRange } from "@/core/server";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/staff/leaves/:id
 * Approve or reject a leave request.
 * Body: { action: "approve" | "reject" }
 * Restricted to Owner / Admin roles.
 */
export const PUT = RouteHandler.wrap(
  "staff/leaves/[id] PUT",
  async (req: NextRequest, { params }: Ctx) => {
    const { user, error } = await Auth.requireRole(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const leaveId = Guard.parseId(id);
    if (!leaveId) return Response.badRequest("Invalid leave ID");

    const leave = await prisma.staffLeaves.findFirst({
      where: { Id: leaveId, ...Guard.activeTenant(user.tenantId) },
    });
    if (!leave) return Response.notFound("Leave request not found");

    const body = await req.json();
    if (body.action !== "approve" && body.action !== "reject") {
      return Response.badRequest("'action' must be 'approve' or 'reject'");
    }

    const isApproving = body.action === "approve";
    const newStatus = isApproving ? "Approved" : "Rejected";
    const now = new Date();

    await prisma.staffLeaves.update({
      where: { Id: leaveId },
      data: {
        Status: newStatus,
        ApprovedById: user.id,
        ApprovedDate: now,
        ...Guard.updateAudit(user.id),
      },
    });

    // Deduct approved days from the staff member's leave balance
    if (isApproving) {
      const days = DateRange.daysBetween(leave.StartDate, leave.EndDate);
      await prisma.staffHRInfos.updateMany({
        where: { StaffId: leave.StaffId, ...Guard.activeTenant(user.tenantId) },
        data: {
          UsedLeaveDays: { increment: days },
          ...Guard.updateAudit(user.id),
        },
      });
    }

    const message = isApproving ? "Leave request approved" : "Leave request rejected";
    return Response.ok(null, message);
  },
);

/**
 * DELETE /api/staff/leaves/:id
 * Soft-delete a leave request.
 */
export const DELETE = RouteHandler.wrap(
  "staff/leaves/[id] DELETE",
  async (req: NextRequest, { params }: Ctx) => {
    const { user, error } = await Auth.requireSubscription(req);
    if (error) return error;

    const { id } = await params;
    const leaveId = Guard.parseId(id);
    if (!leaveId) return Response.badRequest("Invalid leave ID");

    const leave = await prisma.staffLeaves.findFirst({
      where: { Id: leaveId, ...Guard.activeTenant(user.tenantId) },
    });
    if (!leave) return Response.notFound("Leave request not found");

    await prisma.staffLeaves.update({
      where: { Id: leaveId },
      data: Guard.softDelete(user.id),
    });

    return Response.ok(null, "Leave request deleted");
  },
);
