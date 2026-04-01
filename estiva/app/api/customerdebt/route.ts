import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { paginatedResponse, getPaginationParams } from "@/lib/pagination";

// GET /api/customerdebt — List debts or get summary/collections
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action");

    if (action === "summary") {
      // Return debt summary
      const debts = await prisma.customerDebts.findMany({
        where: { TenantId: user!.tenantId, IsActive: true },
      });

      let totalReceivables = 0;
      let totalDebts = 0;
      let overdueReceivables = 0;
      let overdueDebts = 0;
      const now = new Date();

      for (const d of debts) {
        const remaining = Number(d.Amount) - Number(d.PaidAmount);
        const isOverdue = d.DueDate && d.DueDate < now && d.Status !== "Paid";

        if (d.Type === "Receivable") {
          totalReceivables += remaining;
          if (isOverdue) overdueReceivables++;
        } else {
          totalDebts += remaining;
          if (isOverdue) overdueDebts++;
        }
      }

      return success({
        totalReceivables,
        totalDebts,
        overdueReceivableCount: overdueReceivables,
        overdueDebtCount: overdueDebts,
      });
    }

    if (action === "collections") {
      // Return collection/payment records
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

      const mappedPayments = payments.map((p) => ({
        id: p.Id,
        customerDebtId: p.CustomerDebtId,
        customerName: p.CustomerDebts?.Customers ? `${p.CustomerDebts.Customers.Name} ${p.CustomerDebts.Customers.Surname}` : null,
        personName: p.CustomerDebts?.PersonName || null,
        debtDescription: null,
        debtType: p.CustomerDebts?.Type || "",
        amount: Number(p.Amount),
        paymentMethod: p.PaymentMethod,
        notes: p.Notes,
        paymentDate: p.PaymentDate,
        source: null,
        cDate: p.CDate,
      }));

      return success(paginatedResponse(mappedPayments, totalCount, page, pageSize));
    }

    // Default: list debts with pagination
    const { page, pageSize, skip } = getPaginationParams(searchParams);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {
      TenantId: user!.tenantId,
      IsActive: true,
    };

    if (type) where.Type = type;
    if (status) where.Status = status;
    if (search) {
      where.OR = [
        { PersonName: { contains: search } },
        { Description: { contains: search } },
        {
          Customers: {
            OR: [
              { Name: { contains: search } },
              { Surname: { contains: search } },
            ],
          },
        },
      ];
    }

    const [debts, totalCount] = await Promise.all([
      prisma.customerDebts.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { CDate: "desc" },
        include: {
          Customers: {
            select: { Id: true, Name: true, Surname: true, Phone: true },
          },
          CustomerDebtPayments: {
            where: { IsActive: true },
            select: { Id: true, Amount: true, PaymentDate: true, PaymentMethod: true, Notes: true, CustomerDebtId: true, CDate: true },
            orderBy: { PaymentDate: "desc" },
          },
        },
      }),
      prisma.customerDebts.count({ where }),
    ]);

    const mapped = debts.map((d) => ({
      id: d.Id,
      tenantId: d.TenantId,
      customerId: d.CustomerId,
      customerName: d.Customers ? `${d.Customers.Name} ${d.Customers.Surname}` : null,
      customerPhone: d.Customers?.Phone || null,
      personName: d.PersonName,
      type: d.Type,
      amount: Number(d.Amount),
      paidAmount: Number(d.PaidAmount),
      remainingAmount: Number(d.Amount) - Number(d.PaidAmount),
      currency: d.Currency,
      description: d.Description,
      notes: d.Notes,
      dueDate: d.DueDate,
      status: d.Status,
      relatedAppointmentId: d.RelatedAppointmentId,
      relatedPackageSaleId: d.RelatedPackageSaleId,
      source: d.Source,
      cDate: d.CDate,
      payments: (d.CustomerDebtPayments || []).map((p) => ({
        id: p.Id,
        customerDebtId: p.CustomerDebtId,
        amount: Number(p.Amount),
        paymentMethod: p.PaymentMethod,
        notes: p.Notes,
        paymentDate: p.PaymentDate,
        cDate: p.CDate,
      })),
    }));

    return success(paginatedResponse(mapped, totalCount, page, pageSize));
  } catch (err) {
    console.error("Customer debt list error:", err);
    return serverError();
  }
}

// POST /api/customerdebt — Create debt
export async function POST(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const body = await req.json();
    const {
      customerId,
      personName,
      type,
      amount,
      currency,
      description,
      notes,
      dueDate,
      source,
      relatedAppointmentId,
      relatedPackageSaleId,
    } = body;

    if (!type || !amount) {
      return fail("type ve amount zorunludur.");
    }

    if (!["Receivable", "Debt"].includes(type)) {
      return fail("type Receivable veya Debt olmalıdır.");
    }

    if (!customerId && !personName) {
      return fail("customerId veya personName zorunludur.");
    }

    const now = new Date();

    const debt = await prisma.customerDebts.create({
      data: {
        TenantId: user!.tenantId,
        CustomerId: customerId || null,
        PersonName: personName || null,
        Type: type,
        Amount: amount,
        PaidAmount: 0,
        Currency: currency || "TRY",
        Description: description || null,
        Notes: notes || null,
        DueDate: dueDate ? new Date(dueDate) : null,
        Status: "Active",
        Source: source || null,
        RelatedAppointmentId: relatedAppointmentId || null,
        RelatedPackageSaleId: relatedPackageSaleId || null,
        CUser: user!.id,
        CDate: now,
        UUser: user!.id,
        UDate: now,
        IsActive: true,
      },
    });

    return success(debt, "Borç/alacak kaydı başarıyla oluşturuldu.");
  } catch (err) {
    console.error("Customer debt create error:", err);
    return serverError();
  }
}
