import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// PUT /api/customer/[id]/tags — Update customer tags
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) return fail("Geçersiz müşteri ID.", "VALIDATION_ERROR");

    const existing = await prisma.customers.findFirst({
      where: { Id: customerId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!existing) return notFound("Müşteri bulunamadı.");

    const body = await req.json();
    const { tags } = body;

    const updated = await prisma.customers.update({
      where: { Id: customerId },
      data: {
        Tags: tags ?? null,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(
      { id: updated.Id, tags: updated.Tags },
      "Etiketler güncellendi."
    );
  } catch (error) {
    console.error("Customer tags PUT error:", error);
    return serverError();
  }
}
