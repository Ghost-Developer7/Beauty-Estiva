import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError, notFound } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ staffId: string }> }
) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { staffId } = await params;
    const staffIdNum = parseInt(staffId);
    if (isNaN(staffIdNum)) return fail("Geçersiz personel ID");

    const hrInfo = await prisma.staffHRInfos.findFirst({
      where: {
        StaffId: staffIdNum,
        TenantId: user!.tenantId,
        IsActive: true,
      },
      include: {
        Users: {
          select: { Id: true, Name: true, Surname: true, Email: true },
        },
      },
    });

    if (!hrInfo) return notFound("HR bilgisi bulunamadı");

    return success({
      id: hrInfo.Id,
      staffId: hrInfo.StaffId,
      staffName: `${hrInfo.Users.Name} ${hrInfo.Users.Surname}`,
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
      notes: hrInfo.Notes,
    });
  } catch (error) {
    console.error("HR info GET error:", error);
    return serverError();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ staffId: string }> }
) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { staffId } = await params;
    const staffIdNum = parseInt(staffId);
    if (isNaN(staffIdNum)) return fail("Geçersiz personel ID");

    // Verify staff belongs to tenant
    const staff = await prisma.users.findFirst({
      where: { Id: staffIdNum, TenantId: user!.tenantId, IsActive: true },
    });
    if (!staff) return notFound("Personel bulunamadı");

    const body = await req.json();
    const now = new Date();

    const existing = await prisma.staffHRInfos.findFirst({
      where: {
        StaffId: staffIdNum,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    const data: any = {
      UUser: user!.id,
      UDate: now,
    };

    if (body.hireDate !== undefined) data.HireDate = body.hireDate ? new Date(body.hireDate) : null;
    if (body.position !== undefined) data.Position = body.position;
    if (body.salary !== undefined) data.Salary = body.salary;
    if (body.salaryCurrency !== undefined) data.SalaryCurrency = body.salaryCurrency;
    if (body.identityNumber !== undefined) data.IdentityNumber = body.identityNumber;
    if (body.emergencyContactName !== undefined) data.EmergencyContactName = body.emergencyContactName;
    if (body.emergencyContactPhone !== undefined) data.EmergencyContactPhone = body.emergencyContactPhone;
    if (body.annualLeaveEntitlement !== undefined) data.AnnualLeaveEntitlement = body.annualLeaveEntitlement;
    if (body.notes !== undefined) data.Notes = body.notes;

    let result;
    if (existing) {
      result = await prisma.staffHRInfos.update({
        where: { Id: existing.Id },
        data,
      });
    } else {
      result = await prisma.staffHRInfos.create({
        data: {
          TenantId: user!.tenantId,
          StaffId: staffIdNum,
          HireDate: body.hireDate ? new Date(body.hireDate) : null,
          Position: body.position || null,
          Salary: body.salary || null,
          SalaryCurrency: body.salaryCurrency || "TRY",
          IdentityNumber: body.identityNumber || null,
          EmergencyContactName: body.emergencyContactName || null,
          EmergencyContactPhone: body.emergencyContactPhone || null,
          AnnualLeaveEntitlement: body.annualLeaveEntitlement || 14,
          UsedLeaveDays: 0,
          Notes: body.notes || null,
          CUser: user!.id,
          CDate: now,
          IsActive: true,
        },
      });
    }

    return success(result, "HR bilgisi güncellendi");
  } catch (error) {
    console.error("HR info PUT error:", error);
    return serverError();
  }
}
