import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/commission/rates — All commission rates
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const [treatmentCommissions, staffUsers] = await Promise.all([
      prisma.staffTreatmentCommissions.findMany({
        where: { TenantId: user!.tenantId, IsActive: true },
        include: {
          Users: { select: { Id: true, Name: true, Surname: true, DefaultCommissionRate: true } },
          Treatments: { select: { Id: true, Name: true } },
        },
        orderBy: [{ StaffId: "asc" }, { TreatmentId: "asc" }],
      }),
      prisma.users.findMany({
        where: { TenantId: user!.tenantId, IsActive: true },
        select: { Id: true, Name: true, Surname: true, DefaultCommissionRate: true },
      }),
    ]);

    return success({
      treatmentCommissions,
      staffDefaultRates: staffUsers.map((u) => ({
        staffId: u.Id,
        staffName: `${u.Name} ${u.Surname}`,
        defaultCommissionRate: u.DefaultCommissionRate,
      })),
    });
  } catch (err) {
    console.error("Commission rates GET error:", err);
    return serverError();
  }
}
