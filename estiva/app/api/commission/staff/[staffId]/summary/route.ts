import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/commission/staff/[staffId]/summary — Staff-specific commission summary
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
      select: { Id: true, Name: true, Surname: true },
    });

    if (!staff) return notFound("Personel bulunamadı.");

    const records = await prisma.staffCommissionRecords.findMany({
      where: {
        TenantId: user!.tenantId,
        StaffId: staffId,
        IsActive: true,
      },
    });

    let totalEarned = 0;
    let totalPaid = 0;
    let unpaid = 0;

    for (const r of records) {
      const amt = Number(r.CommissionAmountInTry);
      totalEarned += amt;
      if (r.IsPaid) {
        totalPaid += amt;
      } else {
        unpaid += amt;
      }
    }

    return success({
      staffId: staff.Id,
      staffName: `${staff.Name} ${staff.Surname}`,
      totalEarned,
      totalPaid,
      unpaid,
      recordCount: records.length,
    });
  } catch (err) {
    console.error("Staff commission summary GET error:", err);
    return serverError();
  }
}
