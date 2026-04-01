import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// POST /api/commission/records/[id]/pay — Mark single record as paid
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const { id } = await params;
    const recordId = parseInt(id);
    if (isNaN(recordId)) return fail("Geçersiz kayıt ID.");

    const record = await prisma.staffCommissionRecords.findFirst({
      where: { Id: recordId, TenantId: user!.tenantId, IsActive: true },
    });

    if (!record) return notFound("Komisyon kaydı bulunamadı.");

    if (record.IsPaid) return fail("Bu kayıt zaten ödendi olarak işaretli.");

    const now = new Date();
    await prisma.staffCommissionRecords.update({
      where: { Id: recordId },
      data: {
        IsPaid: true,
        PaidAt: now,
        UUser: user!.id,
        UDate: now,
      },
    });

    return success(null, "Komisyon kaydı ödendi olarak işaretlendi.");
  } catch (err) {
    console.error("Commission record pay error:", err);
    return serverError();
  }
}
