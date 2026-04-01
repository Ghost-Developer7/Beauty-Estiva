import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/expense/[id] — Get expense detail
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz gider ID.");

    const expense = await prisma.expenses.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
      include: {
        ExpenseCategories: { select: { Id: true, Name: true, Color: true } },
        Currencies: { select: { Id: true, Code: true, Symbol: true, Name: true } },
      },
    });

    if (!expense) return notFound("Gider bulunamadı.");

    return success(expense);
  } catch (err) {
    console.error("Expense detail error:", err);
    return serverError();
  }
}

// PUT /api/expense/[id] — Update expense
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz gider ID.");

    const existing = await prisma.expenses.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Gider bulunamadı.");

    const body = await req.json();
    const { expenseCategoryId, amount, currencyId, description, expenseDate, receiptNumber, notes } = body;

    const updateData: any = {
      UUser: user!.id,
      UDate: new Date(),
    };

    if (expenseCategoryId !== undefined) updateData.ExpenseCategoryId = expenseCategoryId;
    if (description !== undefined) updateData.Description = description;
    if (expenseDate !== undefined) updateData.ExpenseDate = new Date(expenseDate);
    if (receiptNumber !== undefined) updateData.ReceiptNumber = receiptNumber;
    if (notes !== undefined) updateData.Notes = notes;

    if (amount !== undefined || currencyId !== undefined) {
      const targetCurrencyId = currencyId || existing.CurrencyId;
      const currency = await prisma.currencies.findUnique({ where: { Id: targetCurrencyId } });
      if (!currency) return fail("Para birimi bulunamadı.");

      const targetAmount = amount || Number(existing.Amount);
      const exchangeRate = Number(currency.ExchangeRateToTry || 1);

      updateData.Amount = targetAmount;
      updateData.CurrencyId = targetCurrencyId;
      updateData.ExchangeRateToTry = exchangeRate;
      updateData.AmountInTry = targetAmount * exchangeRate;
    }

    const updated = await prisma.expenses.update({
      where: { Id: id },
      data: updateData,
    });

    return success(updated, "Gider başarıyla güncellendi.");
  } catch (err) {
    console.error("Expense update error:", err);
    return serverError();
  }
}

// DELETE /api/expense/[id] — Soft delete expense
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz gider ID.");

    const existing = await prisma.expenses.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Gider bulunamadı.");

    await prisma.expenses.update({
      where: { Id: id },
      data: { IsActive: false, UUser: user!.id, UDate: new Date() },
    });

    return success(null, "Gider başarıyla silindi.");
  } catch (err) {
    console.error("Expense delete error:", err);
    return serverError();
  }
}
