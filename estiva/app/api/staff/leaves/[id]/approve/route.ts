import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Auth, Response, RouteHandler, Guard, DateRange } from "@/core/server";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PUT /api/staff/leaves/:id/approve
 * Approve a pending leave request and deduct days from the leave balance.
 * Restricted to Owner / Admin roles.
 */
export const PUT = RouteHandler.wrap(
  "staff/leaves/[id]/approve PUT",
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

    if (leave.Status !== "Pending") {
      return Response.badRequest("Only pending requests can be approved");
    }

    const days = DateRange.daysBetween(leave.StartDate, leave.EndDate);

    await prisma.$transaction([
      prisma.staffLeaves.update({
        where: { Id: leaveId },
        data: {
          Status: "Approved",
          ApprovedById: user.id,
          ApprovedDate: new Date(),
          ...Guard.updateAudit(user.id),
        },
      }),
      prisma.staffHRInfos.updateMany({
        where: { StaffId: leave.StaffId, ...Guard.activeTenant(user.tenantId) },
        data: {
          UsedLeaveDays: { increment: days },
          ...Guard.updateAudit(user.id),
        },
      }),
    ]);

    return Response.ok(null, "Leave request approved");
  },
);
