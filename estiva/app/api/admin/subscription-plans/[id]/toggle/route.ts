import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// PATCH /api/admin/subscription-plans/[id]/toggle — Toggle plan active status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRoles(req, ["SuperAdmin"]);
    if (error) return error;

    const { id } = await params;
    const planId = parseInt(id);
    if (isNaN(planId)) return fail("Geçersiz plan ID.");

    const plan = await prisma.subscriptionPlans.findUnique({
      where: { Id: planId },
    });

    if (!plan) return notFound("Plan bulunamadı.");

    const updated = await prisma.subscriptionPlans.update({
      where: { Id: planId },
      data: {
        IsActive: !plan.IsActive,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(
      { id: updated.Id, isActive: updated.IsActive },
      updated.IsActive ? "Plan aktif edildi." : "Plan pasif edildi."
    );
  } catch (error) {
    console.error("Admin plan toggle error:", error);
    return serverError();
  }
}
