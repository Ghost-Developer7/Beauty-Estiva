import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// POST /api/commission/records/bulk-pay — Bulk mark as paid
export async function POST(req: NextRequest) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const body = await req.json();
    const { recordIds } = body;

    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return fail("recordIds dizisi zorunludur.");
    }

    const now = new Date();
    const result = await prisma.staffCommissionRecords.updateMany({
      where: {
        Id: { in: recordIds },
        TenantId: user!.tenantId,
        IsActive: true,
        IsPaid: false,
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
    console.error("Commission bulk pay error:", err);
    return serverError();
  }
}
