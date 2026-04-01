import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/financialreport/dashboard — Dashboard totals
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const paymentWhere: any = { TenantId: user!.tenantId, IsActive: true };
    if (startDate || endDate) paymentWhere.PaidAt = dateFilter;

    const expenseWhere: any = { TenantId: user!.tenantId, IsActive: true };
    if (startDate || endDate) expenseWhere.ExpenseDate = dateFilter;

    const appointmentWhere: any = { TenantId: user!.tenantId, IsActive: true };
    if (startDate || endDate) appointmentWhere.StartTime = dateFilter;

    const [revenueAgg, expenseAgg, appointmentCount] = await Promise.all([
      prisma.appointmentPayments.aggregate({
        where: paymentWhere,
        _sum: { AmountInTry: true },
      }),
      prisma.expenses.aggregate({
        where: expenseWhere,
        _sum: { AmountInTry: true },
      }),
      prisma.appointments.count({ where: appointmentWhere }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.AmountInTry || 0);
    const totalExpenses = Number(expenseAgg._sum.AmountInTry || 0);

    return success({
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      appointmentCount,
    });
  } catch (err) {
    console.error("Financial dashboard error:", err);
    return serverError();
  }
}
