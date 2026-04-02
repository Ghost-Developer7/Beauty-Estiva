import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Auth, Response, RouteHandler, Guard } from "@/core/server";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/staff/:id/hr-info
 * Returns full HR record for a single staff member.
 * Restricted to Owner / Admin roles.
 */
export const GET = RouteHandler.wrap(
  "staff/[id]/hr-info GET",
  async (req: NextRequest, { params }: Ctx) => {
    const { user, error } = await Auth.requireRole(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const staffId = Guard.parseId(id);
    if (!staffId) return Response.badRequest("Invalid staff ID");

    const hrInfo = await prisma.staffHRInfos.findFirst({
      where: { StaffId: staffId, ...Guard.activeTenant(user.tenantId) },
      include: {
        Users: { select: { Name: true, Surname: true, Email: true } },
      },
    });

    if (!hrInfo) return Response.notFound("HR record not found");

    return Response.ok({
      id: hrInfo.Id,
      staffId: hrInfo.StaffId,
      staffFullName: `${hrInfo.Users.Name} ${hrInfo.Users.Surname}`,
      staffEmail: hrInfo.Users.Email,
      hireDate: hrInfo.HireDate,
      position: hrInfo.Position,
      salary: hrInfo.Salary,
      salaryCurrency: hrInfo.SalaryCurrency,
      identityNumber: hrInfo.IdentityNumber,
      emergencyContactName: hrInfo.EmergencyContactName,
      emergencyContactPhone: hrInfo.EmergencyContactPhone,
      annualLeaveEntitlement: hrInfo.AnnualLeaveEntitlement,
      usedLeaveDays: hrInfo.UsedLeaveDays,
      remainingLeaveDays: hrInfo.AnnualLeaveEntitlement - hrInfo.UsedLeaveDays,
      notes: hrInfo.Notes,
    });
  },
);

/**
 * PUT /api/staff/:id/hr-info
 * Upsert the HR record for a staff member.
 * Creates a new record if none exists; updates the existing one otherwise.
 * Restricted to Owner / Admin roles.
 */
export const PUT = RouteHandler.wrap(
  "staff/[id]/hr-info PUT",
  async (req: NextRequest, { params }: Ctx) => {
    const { user, error } = await Auth.requireRole(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const staffId = Guard.parseId(id);
    if (!staffId) return Response.badRequest("Invalid staff ID");

    const staff = await prisma.users.findFirst({
      where: { Id: staffId, ...Guard.activeTenant(user.tenantId) },
    });
    if (!staff) return Response.notFound("Staff member not found");

    const body = await req.json();
    const updateFields = buildUpdateFields(body, user.id);

    const existing = await prisma.staffHRInfos.findFirst({
      where: { StaffId: staffId, ...Guard.activeTenant(user.tenantId) },
    });

    if (existing) {
      await prisma.staffHRInfos.update({
        where: { Id: existing.Id },
        data: updateFields,
      });
    } else {
      await prisma.staffHRInfos.create({
        data: {
          StaffId: staffId,
          HireDate: body.hireDate ? new Date(body.hireDate) : null,
          Position: body.position ?? null,
          Salary: body.salary ?? null,
          SalaryCurrency: body.salaryCurrency ?? "TRY",
          IdentityNumber: body.identityNumber ?? null,
          EmergencyContactName: body.emergencyContactName ?? null,
          EmergencyContactPhone: body.emergencyContactPhone ?? null,
          AnnualLeaveEntitlement: body.annualLeaveEntitlement ?? 14,
          UsedLeaveDays: 0,
          Notes: body.notes ?? null,
          ...Guard.createAudit(user.id, user.tenantId),
        },
      });
    }

    return Response.ok(null, "HR record updated successfully");
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build only the fields present in the request body (partial update). */
function buildUpdateFields(body: Record<string, unknown>, userId: number) {
  const fields: Record<string, unknown> = Guard.updateAudit(userId);

  if (body.hireDate !== undefined)
    fields.HireDate = body.hireDate ? new Date(body.hireDate as string) : null;
  if (body.position !== undefined) fields.Position = body.position;
  if (body.salary !== undefined) fields.Salary = body.salary;
  if (body.salaryCurrency !== undefined) fields.SalaryCurrency = body.salaryCurrency;
  if (body.identityNumber !== undefined) fields.IdentityNumber = body.identityNumber;
  if (body.emergencyContactName !== undefined)
    fields.EmergencyContactName = body.emergencyContactName;
  if (body.emergencyContactPhone !== undefined)
    fields.EmergencyContactPhone = body.emergencyContactPhone;
  if (body.annualLeaveEntitlement !== undefined)
    fields.AnnualLeaveEntitlement = body.annualLeaveEntitlement;
  if (body.notes !== undefined) fields.Notes = body.notes;

  return fields;
}
