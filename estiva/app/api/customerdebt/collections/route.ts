import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { getPaginationParams, paginatedResponse } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const { page, pageSize, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search");
    const paymentMethod = searchParams.get("paymentMethod");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = { TenantId: user!.tenantId, IsActive: true };
    if (startDate || endDate) {
      where.PaymentDate = {};
      if (startDate) where.PaymentDate.gte = new Date(startDate);
      if (endDate) where.PaymentDate.lte = new Date(endDate);
    }
    if (paymentMethod) where.PaymentMethod = paymentMethod;

    const [payments, totalCount] = await Promise.all([
      prisma.customerDebtPayments.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { PaymentDate: "desc" },
        include: {
          CustomerDebts: {
            select: {
              Id: true,
              PersonName: true,
              Type: true,
              Description: true,
              CustomerId: true,
              Customers: { select: { Name: true, Surname: true } },
            },
          },
        },
      }),
      prisma.customerDebtPayments.count({ where }),
    ]);

    const mapped = payments
      .filter((p) => {
        if (!search) return true;
        const customer = p.CustomerDebts?.Customers;
        const name = customer
          ? `${customer.Name} ${customer.Surname}`.toLowerCase()
          : (p.CustomerDebts?.PersonName ?? "").toLowerCase();
        return name.includes(search.toLowerCase());
      })
      .map((p) => {
        const customer = p.CustomerDebts?.Customers;
        return {
          id: p.Id,
          customerDebtId: p.CustomerDebtId,
          customerName: customer
            ? `${customer.Name} ${customer.Surname}`.trim()
            : null,
          personName: p.CustomerDebts?.PersonName ?? null,
          debtDescription: p.CustomerDebts?.Description ?? null,
          debtType: p.CustomerDebts?.Type ?? "",
          amount: Number(p.Amount),
          paymentMethod: p.PaymentMethod ?? "",
          notes: p.Notes ?? null,
          paymentDate: p.PaymentDate?.toISOString() ?? "",
          source: p.Source ?? null,
          cDate: p.CDate?.toISOString() ?? null,
        };
      });

    return success(paginatedResponse(mapped, totalCount, page, pageSize));
  } catch (err) {
    console.error("Debt collections error:", err);
    return serverError();
  }
}
