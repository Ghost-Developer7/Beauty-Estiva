import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// POST /api/customerdebt/[id]/payment — Add payment to a debt
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz borç ID.");

    const debt = await prisma.customerDebts.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!debt) return notFound("Borç/alacak kaydı bulunamadı.");

    const body = await req.json();
    const { amount, paymentMethod, notes } = body;

    if (!amount || !paymentMethod) {
      return fail("amount ve paymentMethod zorunludur.");
    }

    const remainingAmount = Number(debt.Amount) - Number(debt.PaidAmount);
    if (amount > remainingAmount) {
      return fail(`Ödeme tutarı kalan borçtan (${remainingAmount}) fazla olamaz.`);
    }

    const now = new Date();

    const payment = await prisma.customerDebtPayments.create({
      data: {
        TenantId: user!.tenantId,
        CustomerDebtId: id,
        Amount: amount,
        PaymentMethod: paymentMethod,
        Notes: notes || null,
        PaymentDate: now,
        CUser: user!.id,
        CDate: now,
        UUser: user!.id,
        UDate: now,
        IsActive: true,
      },
    });

    const newPaidAmount = Number(debt.PaidAmount) + amount;
    const newStatus = newPaidAmount >= Number(debt.Amount) ? "Paid" : "PartiallyPaid";

    await prisma.customerDebts.update({
      where: { Id: id },
      data: {
        PaidAmount: newPaidAmount,
        Status: newStatus,
        UUser: user!.id,
        UDate: now,
      },
    });

    return success(payment, "Ödeme başarıyla kaydedildi.");
  } catch (err) {
    console.error("Debt payment error:", err);
    return serverError();
  }
}
