import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/commission/staff/[staffId]/rates — Staff-specific commission rates
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ staffId: string }> }
) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const { staffId: rawId } = await params;
    const staffId = parseInt(rawId);
    if (isNaN(staffId)) return fail("Geçersiz personel ID.");

    const staff = await prisma.users.findFirst({
      where: { Id: staffId, TenantId: user!.tenantId, IsActive: true },
      select: { Id: true, Name: true, Surname: true, DefaultCommissionRate: true },
    });

    if (!staff) return notFound("Personel bulunamadı.");

    const treatmentCommissions = await prisma.staffTreatmentCommissions.findMany({
      where: { TenantId: user!.tenantId, StaffId: staffId, IsActive: true },
      include: {
        Treatments: { select: { Id: true, Name: true } },
      },
      orderBy: { TreatmentId: "asc" },
    });

    return success({
      staffId: staff.Id,
      staffName: `${staff.Name} ${staff.Surname}`,
      defaultCommissionRate: staff.DefaultCommissionRate,
      treatmentCommissions: treatmentCommissions.map((tc) => ({
        id: tc.Id,
        treatmentId: tc.TreatmentId,
        treatmentName: tc.Treatments.Name,
        commissionRate: tc.CommissionRate,
      })),
    });
  } catch (err) {
    console.error("Staff commission rates GET error:", err);
    return serverError();
  }
}

// PUT /api/commission/staff/[staffId]/rates — Update staff-specific commission rates
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ staffId: string }> }
) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const { staffId: rawId } = await params;
    const staffId = parseInt(rawId);
    if (isNaN(staffId)) return fail("Geçersiz personel ID.");

    const staff = await prisma.users.findFirst({
      where: { Id: staffId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!staff) return notFound("Personel bulunamadı.");

    const body = await req.json();
    const { defaultCommissionRate, rates } = body;
    const now = new Date();

    // Update default commission rate if provided
    if (defaultCommissionRate !== undefined) {
      await prisma.users.update({
        where: { Id: staffId },
        data: { DefaultCommissionRate: defaultCommissionRate, UUser: user!.id, UDate: now },
      });
    }

    // Update treatment-specific rates
    if (rates && Array.isArray(rates)) {
      for (const rate of rates) {
        const { treatmentId, commissionRate } = rate;
        if (!treatmentId || commissionRate === undefined) continue;

        const existing = await prisma.staffTreatmentCommissions.findFirst({
          where: {
            TenantId: user!.tenantId,
            StaffId: staffId,
            TreatmentId: treatmentId,
            IsActive: true,
          },
        });

        if (existing) {
          await prisma.staffTreatmentCommissions.update({
            where: { Id: existing.Id },
            data: { CommissionRate: commissionRate, UUser: user!.id, UDate: now },
          });
        } else {
          await prisma.staffTreatmentCommissions.create({
            data: {
              TenantId: user!.tenantId,
              StaffId: staffId,
              TreatmentId: treatmentId,
              CommissionRate: commissionRate,
              CUser: user!.id,
              CDate: now,
              UUser: user!.id,
              UDate: now,
              IsActive: true,
            },
          });
        }
      }
    }

    return success(null, "Komisyon oranları güncellendi.");
  } catch (err) {
    console.error("Staff commission rates PUT error:", err);
    return serverError();
  }
}
