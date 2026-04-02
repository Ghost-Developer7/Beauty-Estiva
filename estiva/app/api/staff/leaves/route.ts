import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Auth, Response, RouteHandler, Guard, DateRange } from "@/core/server";

/**
 * GET /api/staff/leaves
 * List all leave requests for the tenant, with optional filters.
 * Query params: staffId?, status?, month?, year?
 */
export const GET = RouteHandler.wrap(
  "staff/leaves GET",
  async (req: NextRequest) => {
    const { user, error } = await Auth.requireSubscription(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const staffId = Guard.parseId(searchParams.get("staffId"));
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      ...Guard.activeTenant(user.tenantId),
      ...(staffId && { StaffId: staffId }),
      ...(status && { Status: status }),
    };

    // Optional month/year date filter
    const range = DateRange.fromMonthQuery(searchParams);
    if (range) {
      where.StartDate = { lte: range.end };
      where.EndDate = { gte: range.start };
    }

    const rows = await prisma.staffLeaves.findMany({
      where,
      include: {
        Users_StaffLeaves_StaffIdToUsers: {
          select: { Name: true, Surname: true },
        },
        Users_StaffLeaves_ApprovedByIdToUsers: {
          select: { Name: true, Surname: true },
        },
      },
      orderBy: { StartDate: "desc" },
    });

    return Response.ok(rows.map(mapLeave));
  },
);

/**
 * POST /api/staff/leaves
 * Create a new leave request.
 * Body: { staffId?, startDate, endDate, leaveType, reason? }
 */
export const POST = RouteHandler.wrap(
  "staff/leaves POST",
  async (req: NextRequest) => {
    const { user, error } = await Auth.requireSubscription(req);
    if (error) return error;

    const body = await req.json();
    const missing = Guard.requireFields(body, ["startDate", "endDate", "leaveType"]);
    if (missing.length) {
      return Response.badRequest(`Missing required fields: ${missing.join(", ")}`);
    }

    const staffId: number = body.staffId ?? user.id;

    const staff = await prisma.users.findFirst({
      where: { Id: staffId, ...Guard.activeTenant(user.tenantId) },
    });
    if (!staff) return Response.badRequest("Staff member not found");

    const leave = await prisma.staffLeaves.create({
      data: {
        StaffId: staffId,
        StartDate: new Date(body.startDate),
        EndDate: new Date(body.endDate),
        LeaveType: body.leaveType,
        Reason: body.reason ?? null,
        Status: "Pending",
        ...Guard.createAudit(user.id, user.tenantId),
      },
    });

    return Response.created({ id: leave.Id }, "Leave request created");
  },
);

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapLeave(l: {
  Id: number;
  StaffId: number;
  StartDate: Date;
  EndDate: Date;
  LeaveType: string;
  Reason: string | null;
  Status: string;
  ApprovedById: number | null;
  ApprovedDate: Date | null;
  Users_StaffLeaves_StaffIdToUsers: { Name: string; Surname: string };
  Users_StaffLeaves_ApprovedByIdToUsers: { Name: string; Surname: string } | null;
}) {
  const durationDays = DateRange.daysBetween(l.StartDate, l.EndDate);
  return {
    id: l.Id,
    staffId: l.StaffId,
    staffFullName: `${l.Users_StaffLeaves_StaffIdToUsers.Name} ${l.Users_StaffLeaves_StaffIdToUsers.Surname}`,
    startDate: l.StartDate,
    endDate: l.EndDate,
    durationDays,
    leaveType: l.LeaveType,
    reason: l.Reason,
    status: l.Status,
    approvedById: l.ApprovedById,
    approvedByName: l.Users_StaffLeaves_ApprovedByIdToUsers
      ? `${l.Users_StaffLeaves_ApprovedByIdToUsers.Name} ${l.Users_StaffLeaves_ApprovedByIdToUsers.Surname}`
      : null,
    approvedDate: l.ApprovedDate,
  };
}
