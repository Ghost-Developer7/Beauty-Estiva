import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// POST /api/commission/mark-paid — Mark paid by staffId + date range
export async function POST(req: NextRequest) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const body = await req.json();
    const { staffId, startDate, endDate } = body;

    if (!staffId || !startDate || !endDate) {
      return fail("staffId, startDate ve endDate zorunludur.");
    }

    const now = new Date();
    const result = await prisma.staffCommissionRecords.updateMany({
      where: {
        TenantId: user!.tenantId,
        StaffId: staffId,
        IsActive: true,
        IsPaid: false,
        CDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      data: {
        IsPaid: true,
        PaidAt: now,
        UUser: user!.id,
        UDate: now,
      },
    });

    return success(null, `${result.count} komisyon kaydı ödendi olarak işaretlendi.`);
  } catch (err) {
    console.error("Commission mark-paid error:", err);
    return serverError();
  }
}
