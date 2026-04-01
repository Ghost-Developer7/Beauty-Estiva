import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/customerdebt/[id] — Get debt detail
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz borç ID.");

    const debt = await prisma.customerDebts.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
      include: {
        Customers: {
          select: { Id: true, Name: true, Surname: true, Phone: true, Email: true },
        },
        CustomerDebtPayments: {
          where: { IsActive: true },
          orderBy: { PaymentDate: "desc" },
        },
      },
    });

    if (!debt) return notFound("Borç/alacak kaydı bulunamadı.");

    return success(debt);
  } catch (err) {
    console.error("Customer debt detail error:", err);
    return serverError();
  }
}

// PUT /api/customerdebt/[id] — Update debt
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz borç ID.");

    const existing = await prisma.customerDebts.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Borç/alacak kaydı bulunamadı.");

    const body = await req.json();
    const { personName, amount, currency, description, notes, dueDate, status } = body;

    const updateData: any = {
      UUser: user!.id,
      UDate: new Date(),
    };

    if (personName !== undefined) updateData.PersonName = personName;
    if (amount !== undefined) updateData.Amount = amount;
    if (currency !== undefined) updateData.Currency = currency;
    if (description !== undefined) updateData.Description = description;
    if (notes !== undefined) updateData.Notes = notes;
    if (dueDate !== undefined) updateData.DueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) updateData.Status = status;

    const updated = await prisma.customerDebts.update({
      where: { Id: id },
      data: updateData,
    });

    return success(updated, "Borç/alacak kaydı güncellendi.");
  } catch (err) {
    console.error("Customer debt update error:", err);
    return serverError();
  }
}

// DELETE /api/customerdebt/[id] — Soft delete debt
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz borç ID.");

    const existing = await prisma.customerDebts.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Borç/alacak kaydı bulunamadı.");

    await prisma.customerDebts.update({
      where: { Id: id },
      data: { IsActive: false, UUser: user!.id, UDate: new Date() },
    });

    return success(null, "Borç/alacak kaydı silindi.");
  } catch (err) {
    console.error("Customer debt delete error:", err);
    return serverError();
  }
}

// POST /api/customerdebt/[id] — Add payment to a debt
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Create payment record
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

    // Update debt paid amount and status
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
    console.error("Customer debt payment error:", err);
    return serverError();
  }
}
