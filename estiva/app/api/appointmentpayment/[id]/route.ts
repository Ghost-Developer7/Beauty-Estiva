import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/appointmentpayment/[id] — Get payment detail
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz ödeme ID.");

    const payment = await prisma.appointmentPayments.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
      include: {
        Appointments: {
          select: {
            Id: true,
            StartTime: true,
            Customers: { select: { Id: true, Name: true, Surname: true } },
            Treatments: { select: { Id: true, Name: true } },
            Users: { select: { Id: true, Name: true, Surname: true } },
          },
        },
        Currencies: {
          select: { Id: true, Code: true, Symbol: true, Name: true },
        },
        StaffCommissionRecords: {
          where: { IsActive: true },
          select: {
            Id: true,
            CommissionRate: true,
            CommissionAmountInTry: true,
            SalonShareInTry: true,
            IsPaid: true,
          },
        },
      },
    });

    if (!payment) return notFound("Ödeme bulunamadı.");

    return success(payment);
  } catch (err) {
    console.error("Payment detail error:", err);
    return serverError();
  }
}

// PUT /api/appointmentpayment/[id] — Update payment
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz ödeme ID.");

    const existing = await prisma.appointmentPayments.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Ödeme bulunamadı.");

    const body = await req.json();
    const { amount, currencyId, paymentMethod, notes } = body;

    const updateData: any = {
      UUser: user!.id,
      UDate: new Date(),
    };

    if (amount !== undefined) updateData.Amount = amount;
    if (paymentMethod !== undefined) updateData.PaymentMethod = paymentMethod;
    if (notes !== undefined) updateData.Notes = notes;

    if (currencyId !== undefined) {
      const currency = await prisma.currencies.findUnique({ where: { Id: currencyId } });
      if (!currency) return fail("Para birimi bulunamadı.");
      updateData.CurrencyId = currencyId;
      updateData.ExchangeRateToTry = currency.ExchangeRateToTry || 1;
      updateData.AmountInTry = (amount || Number(existing.Amount)) * Number(currency.ExchangeRateToTry || 1);
    } else if (amount !== undefined) {
      updateData.AmountInTry = amount * Number(existing.ExchangeRateToTry);
    }

    const updated = await prisma.appointmentPayments.update({
      where: { Id: id },
      data: updateData,
    });

    return success(updated, "Ödeme başarıyla güncellendi.");
  } catch (err) {
    console.error("Payment update error:", err);
    return serverError();
  }
}

// DELETE /api/appointmentpayment/[id] — Soft delete payment
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz ödeme ID.");

    const existing = await prisma.appointmentPayments.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Ödeme bulunamadı.");

    await prisma.appointmentPayments.update({
      where: { Id: id },
      data: { IsActive: false, UUser: user!.id, UDate: new Date() },
    });

    // Also deactivate related commission records
    await prisma.staffCommissionRecords.updateMany({
      where: { AppointmentPaymentId: id, IsActive: true },
      data: { IsActive: false, UUser: user!.id, UDate: new Date() },
    });

    return success(null, "Ödeme başarıyla silindi.");
  } catch (err) {
    console.error("Payment delete error:", err);
    return serverError();
  }
}
