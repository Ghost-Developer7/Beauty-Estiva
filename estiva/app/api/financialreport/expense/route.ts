import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/financialreport/expense — Expense breakdown by category
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

    const expenseWhere: any = { TenantId: user!.tenantId, IsActive: true };
    if (startDate || endDate) expenseWhere.ExpenseDate = dateFilter;

    const expenses = await prisma.expenses.findMany({
      where: expenseWhere,
      include: {
        ExpenseCategories: { select: { Id: true, Name: true, Color: true } },
      },
    });

    const byCategory: Record<string, { categoryName: string; color: string | null; total: number; count: number }> = {};

    for (const e of expenses) {
      const catKey = e.ExpenseCategoryId ? String(e.ExpenseCategoryId) : "uncategorized";
      if (!byCategory[catKey]) {
        byCategory[catKey] = {
          categoryName: e.ExpenseCategories?.Name || "Kategorisiz",
          color: e.ExpenseCategories?.Color || null,
          total: 0,
          count: 0,
        };
      }
      byCategory[catKey].total += Number(e.AmountInTry);
      byCategory[catKey].count += 1;
    }

    return success({
      byCategory: Object.entries(byCategory).map(([id, v]) => ({
        categoryId: id === "uncategorized" ? null : parseInt(id),
        ...v,
      })),
      totalExpenses: expenses.reduce((sum, e) => sum + Number(e.AmountInTry), 0),
    });
  } catch (err) {
    console.error("Financial expense error:", err);
    return serverError();
  }
}
