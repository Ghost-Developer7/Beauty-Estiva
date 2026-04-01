import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { getPaginationParams, paginatedResponse } from "@/lib/pagination";

// GET /api/customerdebt/collections — Collection/payment records
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const [payments, totalCount] = await Promise.all([
      prisma.customerDebtPayments.findMany({
        where: { TenantId: user!.tenantId, IsActive: true },
        skip,
        take: pageSize,
        orderBy: { PaymentDate: "desc" },
        include: {
          CustomerDebts: {
            select: {
              Id: true,
              PersonName: true,
              Type: true,
              Amount: true,
              CustomerId: true,
              Customers: { select: { Name: true, Surname: true } },
            },
          },
        },
      }),
      prisma.customerDebtPayments.count({
        where: { TenantId: user!.tenantId, IsActive: true },
      }),
    ]);

    return success(paginatedResponse(payments, totalCount, page, pageSize));
  } catch (err) {
    console.error("Debt collections error:", err);
    return serverError();
  }
}
