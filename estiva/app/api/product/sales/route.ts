import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { paginatedResponse, getPaginationParams } from "@/lib/pagination";

/**
 * GET /api/product/sales
 * List product sales with pagination and filters.
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const staffId = searchParams.get("staffId");
    const customerId = searchParams.get("customerId");

    const where: Record<string, unknown> = {
      TenantId: user!.tenantId,
      IsActive: true,
    };

    if (startDate) {
      where.SaleDate = { ...(where.SaleDate as object || {}), gte: new Date(startDate) };
    }
    if (endDate) {
      where.SaleDate = { ...(where.SaleDate as object || {}), lte: new Date(endDate) };
    }
    if (staffId) {
      where.StaffId = parseInt(staffId);
    }
    if (customerId) {
      where.CustomerId = parseInt(customerId);
    }

    const [sales, totalCount] = await Promise.all([
      prisma.productSales.findMany({
        where,
        select: {
          Id: true,
          Quantity: true,
          UnitPrice: true,
          TotalAmount: true,
          AmountInTry: true,
          PaymentMethod: true,
          SaleDate: true,
          Notes: true,
          Products: { select: { Id: true, Name: true } },
          Customers: { select: { Id: true, Name: true, Surname: true } },
          Users: { select: { Id: true, Name: true, Surname: true } },
          Currencies: { select: { Id: true, Code: true, Symbol: true, ExchangeRateToTry: true } },
        },
        orderBy: { SaleDate: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.productSales.count({ where }),
    ]);

    const PM: Record<string | number, string> = {
      1: "Cash", 2: "Credit Card", 3: "Bank Transfer", 4: "Check", 5: "Other",
      Cash: "Cash", CreditCard: "Credit Card", BankTransfer: "Bank Transfer", Check: "Check", Other: "Other",
    };

    const items = sales.map((s) => ({
      id: s.Id,
      productId: s.Products?.Id ?? 0,
      productName: s.Products?.Name ?? "",
      customerId: s.Customers?.Id ?? null,
      customerFullName: s.Customers ? `${s.Customers.Name} ${s.Customers.Surname}`.trim() : null,
      staffId: s.Users?.Id ?? 0,
      staffFullName: s.Users ? `${s.Users.Name} ${s.Users.Surname}`.trim() : "",
      quantity: s.Quantity,
      unitPrice: Number(s.UnitPrice),
      totalAmount: Number(s.TotalAmount),
      currencyCode: s.Currencies?.Code ?? "TRY",
      currencySymbol: s.Currencies?.Symbol ?? "₺",
      exchangeRateToTry: Number(s.Currencies?.ExchangeRateToTry ?? 1),
      amountInTry: Number(s.AmountInTry),
      paymentMethodValue: s.PaymentMethod,
      paymentMethodDisplay: PM[s.PaymentMethod as unknown as string] ?? String(s.PaymentMethod),
      saleDate: s.SaleDate,
      notes: s.Notes,
    }));

    return success(paginatedResponse(items, totalCount, page, pageSize));
  } catch (error) {
    console.error("List product sales error:", error);
    return serverError();
  }
}

/**
 * POST /api/product/sales
 * Create product sale.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const body = await req.json();
    const {
      productId,
      customerId,
      staffId,
      quantity,
      unitPrice,
      currencyId,
      exchangeRateToTry,
      paymentMethod,
      saleDate,
      notes,
    } = body;

    if (!productId || !staffId || !quantity || unitPrice === undefined || !currencyId || !paymentMethod) {
      return fail("Ürün, personel, miktar, birim fiyat, para birimi ve ödeme yöntemi zorunludur.", "VALIDATION_ERROR");
    }

    // Verify product exists and belongs to tenant
    const product = await prisma.products.findFirst({
      where: {
        Id: productId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!product) {
      return fail("Ürün bulunamadı.", "NOT_FOUND");
    }

    const totalAmount = quantity * unitPrice;
    const rate = exchangeRateToTry || 1;
    const amountInTry = totalAmount * rate;

    const sale = await prisma.$transaction(async (tx) => {
      // Create the sale
      const newSale = await tx.productSales.create({
        data: {
          TenantId: user!.tenantId,
          ProductId: productId,
          CustomerId: customerId || null,
          StaffId: staffId,
          Quantity: quantity,
          UnitPrice: unitPrice,
          TotalAmount: totalAmount,
          CurrencyId: currencyId,
          ExchangeRateToTry: rate,
          AmountInTry: amountInTry,
          PaymentMethod: paymentMethod,
          SaleDate: saleDate ? new Date(saleDate) : new Date(),
          Notes: notes || null,
          CUser: user!.id,
          CDate: new Date(),
          IsActive: true,
        },
      });

      // Update product stock
      await tx.products.update({
        where: { Id: productId },
        data: {
          StockQuantity: { decrement: quantity },
          UUser: user!.id,
          UDate: new Date(),
        },
      });

      return newSale;
    });

    return success(
      {
        id: sale.Id,
        totalAmount: sale.TotalAmount,
        amountInTry: sale.AmountInTry,
        saleDate: sale.SaleDate,
      },
      "Ürün satışı başarıyla kaydedildi."
    );
  } catch (error) {
    console.error("Create product sale error:", error);
    return serverError("Ürün satışı kaydedilirken bir hata oluştu.");
  }
}
