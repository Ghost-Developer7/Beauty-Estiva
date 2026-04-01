import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// GET /api/sms/balance — SMS credit balance
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const smsIntegration = await prisma.tenantSMSIntegrations.findUnique({
      where: { TenantId: user!.tenantId },
    });

    if (!smsIntegration) return fail("SMS entegrasyonu bulunamadı");

    return success({
      creditBalance: smsIntegration.CreditBalance,
      creditBalanceUpdatedAt: smsIntegration.CreditBalanceUpdatedAt,
    });
  } catch (error) {
    console.error("SMS balance GET error:", error);
    return serverError();
  }
}
