import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { paginatedResponse, getPaginationParams } from "@/lib/pagination";

// GET /api/appointmentpayment — List payments with pagination
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const staffId = searchParams.get("staffId");
    const customerId = searchParams.get("customerId");

    const where: any = {
      TenantId: user!.tenantId,
      IsActive: true,
    };

    if (startDate) {
      where.PaidAt = { ...where.PaidAt, gte: new Date(startDate) };
    }
    if (endDate) {
      where.PaidAt = { ...where.PaidAt, lte: new Date(endDate) };
    }
    if (staffId || customerId) {
      where.Appointments = {};
      if (staffId) where.Appointments.StaffId = parseInt(staffId);
      if (customerId) where.Appointments.CustomerId = parseInt(customerId);
    }

    const [payments, totalCount] = await Promise.all([
      prisma.appointmentPayments.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { PaidAt: "desc" },
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
        },
      }),
      prisma.appointmentPayments.count({ where }),
    ]);

    const PAYMENT_METHOD_NAMES: Record<number, string> = { 1: "Nakit", 2: "Kredi Kartı", 3: "Havale/EFT", 4: "Çek", 5: "Diğer" };

    const items = payments.map((p) => ({
      id: p.Id,
      appointmentId: p.Appointments.Id,
      amount: p.Amount,
      amountInTry: p.AmountInTry,
      exchangeRateToTry: p.ExchangeRateToTry,
      paymentMethod: p.PaymentMethod,
      paymentMethodDisplay: PAYMENT_METHOD_NAMES[p.PaymentMethod] || "Diğer",
      paidAt: p.PaidAt,
      notes: p.Notes,
      currencyCode: p.Currencies.Code,
      currencySymbol: p.Currencies.Symbol,
      customerName: `${p.Appointments.Customers.Name} ${p.Appointments.Customers.Surname}`,
      customerId: p.Appointments.Customers.Id,
      treatmentName: p.Appointments.Treatments.Name,
      treatmentId: p.Appointments.Treatments.Id,
      staffName: `${p.Appointments.Users.Name} ${p.Appointments.Users.Surname}`,
      staffId: p.Appointments.Users.Id,
      appointmentDate: p.Appointments.StartTime,
    }));

    return success(paginatedResponse(items, totalCount, page, pageSize));
  } catch (err) {
    console.error("Payment list error:", err);
    return serverError();
  }
}

// POST /api/appointmentpayment — Create payment
export async function POST(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { appointmentId, amount, currencyId, paymentMethod, notes } = body;

    if (!appointmentId || !amount || !currencyId || paymentMethod === undefined) {
      return fail("appointmentId, amount, currencyId ve paymentMethod zorunludur.");
    }

    // Verify appointment belongs to tenant
    const appointment = await prisma.appointments.findFirst({
      where: { Id: appointmentId, TenantId: user!.tenantId, IsActive: true },
      include: { Users: { select: { Id: true, DefaultCommissionRate: true } } },
    });

    if (!appointment) {
      return fail("Randevu bulunamadı.");
    }

    // Get currency for exchange rate
    const currency = await prisma.currencies.findUnique({
      where: { Id: currencyId },
    });

    if (!currency) {
      return fail("Para birimi bulunamadı.");
    }

    const exchangeRate = currency.ExchangeRateToTry ? Number(currency.ExchangeRateToTry) : 1;
    const amountNum = Number(amount);
    const amountInTry = amountNum * exchangeRate;

    const now = new Date();

    const payment = await prisma.appointmentPayments.create({
      data: {
        TenantId: user!.tenantId,
        AppointmentId: appointmentId,
        Amount: amountNum,
        CurrencyId: currencyId,
        ExchangeRateToTry: exchangeRate,
        AmountInTry: amountInTry,
        PaymentMethod: paymentMethod,
        PaidAt: now,
        Notes: notes || null,
        CUser: user!.id,
        CDate: now,
        UUser: user!.id,
        UDate: now,
        IsActive: true,
      },
    });

    // Create StaffCommissionRecord if staff has commission rate
    const staffCommissionRate = appointment.Users.DefaultCommissionRate;

    // Also check treatment-specific commission
    const treatmentCommission = await prisma.staffTreatmentCommissions.findFirst({
      where: {
        TenantId: user!.tenantId,
        StaffId: appointment.StaffId,
        TreatmentId: appointment.TreatmentId,
        IsActive: true,
      },
    });

    const commissionRate = treatmentCommission
      ? treatmentCommission.CommissionRate
      : staffCommissionRate;

    if (commissionRate && Number(commissionRate) > 0) {
      const rateNum = Number(commissionRate);
      const commissionAmount = (amountInTry * rateNum) / 100;
      const salonShare = amountInTry - commissionAmount;

      await prisma.staffCommissionRecords.create({
        data: {
          TenantId: user!.tenantId,
          StaffId: appointment.StaffId,
          AppointmentPaymentId: payment.Id,
          CommissionRate: commissionRate,
          PaymentAmountInTry: amountInTry,
          CommissionAmountInTry: commissionAmount,
          SalonShareInTry: salonShare,
          IsPaid: false,
          CUser: user!.id,
          CDate: now,
          UUser: user!.id,
          UDate: now,
          IsActive: true,
        },
      });
    }

    return success(payment, "Ödeme başarıyla oluşturuldu.");
  } catch (err) {
    console.error("Payment create error:", err);
    return serverError();
  }
}
