import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { paginatedResponse, getPaginationParams } from "@/lib/pagination";

// GET /api/expense — List expenses with pagination
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");

    const where: any = {
      TenantId: user!.tenantId,
      IsActive: true,
    };

    if (startDate) {
      where.ExpenseDate = { ...where.ExpenseDate, gte: new Date(startDate) };
    }
    if (endDate) {
      where.ExpenseDate = { ...where.ExpenseDate, lte: new Date(endDate) };
    }
    if (categoryId) {
      where.ExpenseCategoryId = parseInt(categoryId);
    }

    const pageParam = searchParams.get("page") || searchParams.get("pageNumber");

    const [expenses, totalCount] = await Promise.all([
      prisma.expenses.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { ExpenseDate: "desc" },
        include: {
          ExpenseCategories: {
            select: { Id: true, Name: true, Color: true },
          },
          Currencies: {
            select: { Id: true, Code: true, Symbol: true },
          },
        },
      }),
      prisma.expenses.count({ where }),
    ]);

    const mapped = expenses.map((e) => ({
      id: e.Id,
      categoryId: e.ExpenseCategoryId,
      categoryName: e.ExpenseCategories?.Name || "",
      amount: Number(e.Amount),
      currencyCode: e.Currencies?.Code || "TRY",
      currencySymbol: e.Currencies?.Symbol || "₺",
      exchangeRateToTry: Number(e.ExchangeRateToTry) || 1,
      amountInTry: Number(e.AmountInTry) || 0,
      description: e.Description,
      expenseDate: e.ExpenseDate,
      receiptNumber: e.ReceiptNumber,
      notes: e.Notes,
    }));

    // If no page param, return flat array for list() calls
    if (!pageParam) {
      return success(mapped);
    }

    return success(paginatedResponse(mapped, totalCount, page, pageSize));
  } catch (err) {
    console.error("Expense list error:", err);
    return serverError();
  }
}

// POST /api/expense — Create expense
export async function POST(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { expenseCategoryId, amount, currencyId, description, expenseDate, receiptNumber, notes } = body;

    if (!amount || !currencyId || !description || !expenseDate) {
      return fail("amount, currencyId, description ve expenseDate zorunludur.");
    }

    const currency = await prisma.currencies.findUnique({ where: { Id: currencyId } });
    if (!currency) return fail("Para birimi bulunamadı.");

    const exchangeRate = currency.ExchangeRateToTry ? Number(currency.ExchangeRateToTry) : 1;
    const amountNum = Number(amount);
    const amountInTry = amountNum * exchangeRate;

    const now = new Date();

    const expense = await prisma.expenses.create({
      data: {
        TenantId: user!.tenantId,
        ExpenseCategoryId: expenseCategoryId || null,
        Amount: amountNum,
        CurrencyId: currencyId,
        ExchangeRateToTry: exchangeRate,
        AmountInTry: amountInTry,
        Description: description,
        ExpenseDate: new Date(expenseDate),
        ReceiptNumber: receiptNumber || null,
        Notes: notes || null,
        CUser: user!.id,
        CDate: now,
        UUser: user!.id,
        UDate: now,
        IsActive: true,
      },
    });

    return success(expense, "Gider başarıyla oluşturuldu.");
  } catch (err) {
    console.error("Expense create error:", err);
    return serverError();
  }
}
