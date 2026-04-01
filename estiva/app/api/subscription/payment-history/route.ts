import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";
import { getPaginationParams, paginatedResponse } from "@/lib/pagination";

// GET /api/subscription/payment-history — Payment history [Owner]
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const where = { TenantId: user!.tenantId, IsActive: true };
    const [items, totalCount] = await Promise.all([
      prisma.tenantPaymentHistories.findMany({
        where,
        orderBy: { PaymentDate: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.tenantPaymentHistories.count({ where }),
    ]);

    const mapped = items.map((p) => ({
      id: p.Id,
      amount: p.Amount,
      paymentDate: p.PaymentDate,
      transactionId: p.TransactionId,
      paymentStatus: p.PaymentStatus,
      description: p.Description,
      paymentMethod: p.PaymentMethod,
      isRefunded: p.IsRefunded,
      refundAmount: p.RefundAmount,
      refundDate: p.RefundDate,
    }));

    return success(paginatedResponse(mapped, totalCount, page, pageSize));
  } catch (error) {
    console.error("Payment history GET error:", error);
    return serverError();
  }
}
