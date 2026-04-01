import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// POST /api/subscription/cancel — Cancel subscription [Owner]
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner"]);
    if (error) return error;

    const body = await req.json();

    const subscription = await prisma.tenantSubscriptions.findFirst({
      where: { TenantId: user!.tenantId, IsActive: true, IsCancelled: false },
      orderBy: { StartDate: "desc" },
    });

    if (!subscription) return fail("Aktif abonelik bulunamadı");

    await prisma.tenantSubscriptions.update({
      where: { Id: subscription.Id },
      data: {
        IsCancelled: true,
        CancelledDate: new Date(),
        CancelReason: body.reason || null,
        AutoRenew: false,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(null, "Abonelik iptal edildi. Süreniz dolana kadar kullanmaya devam edebilirsiniz.");
  } catch (error) {
    console.error("Subscription cancel error:", error);
    return serverError();
  }
}
