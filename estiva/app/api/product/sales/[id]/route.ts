import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/product/sales/[id] — Single product sale detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { id } = await params;
    const saleId = parseInt(id);
    if (isNaN(saleId)) return fail("Geçersiz satış ID.", "VALIDATION_ERROR");

    const sale = await prisma.productSales.findFirst({
      where: { Id: saleId, TenantId: user!.tenantId, IsActive: true },
      include: {
        Products: { select: { Id: true, Name: true } },
        Customers: { select: { Id: true, Name: true, Surname: true } },
        Users: { select: { Id: true, Name: true, Surname: true } },
        Currencies: { select: { Id: true, Code: true, Symbol: true } },
      },
    });

    if (!sale) return notFound("Satış kaydı bulunamadı.");

    return success({
      id: sale.Id,
      product: sale.Products ? { id: sale.Products.Id, name: sale.Products.Name } : null,
      customer: sale.Customers
        ? { id: sale.Customers.Id, name: sale.Customers.Name, surname: sale.Customers.Surname }
        : null,
      staff: sale.Users
        ? { id: sale.Users.Id, name: sale.Users.Name, surname: sale.Users.Surname }
        : null,
      currency: sale.Currencies
        ? { id: sale.Currencies.Id, code: sale.Currencies.Code, symbol: sale.Currencies.Symbol }
        : null,
      quantity: sale.Quantity,
      unitPrice: sale.UnitPrice,
      totalAmount: sale.TotalAmount,
      amountInTry: sale.AmountInTry,
      paymentMethod: sale.PaymentMethod,
      saleDate: sale.SaleDate,
      notes: sale.Notes,
    });
  } catch (error) {
    console.error("Product sale GET error:", error);
    return serverError();
  }
}

// DELETE /api/product/sales/[id] — Delete product sale
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { id } = await params;
    const saleId = parseInt(id);
    if (isNaN(saleId)) return fail("Geçersiz satış ID.", "VALIDATION_ERROR");

    const sale = await prisma.productSales.findFirst({
      where: { Id: saleId, TenantId: user!.tenantId, IsActive: true },
    });

    if (!sale) return notFound("Satış kaydı bulunamadı.");

    await prisma.$transaction(async (tx) => {
      // Soft delete the sale
      await tx.productSales.update({
        where: { Id: saleId },
        data: { IsActive: false, UUser: user!.id, UDate: new Date() },
      });

      // Restore product stock
      if (sale.ProductId) {
        await tx.products.update({
          where: { Id: sale.ProductId },
          data: {
            StockQuantity: { increment: sale.Quantity },
            UUser: user!.id,
            UDate: new Date(),
          },
        });
      }
    });

    return success(null, "Satış kaydı silindi.");
  } catch (error) {
    console.error("Product sale DELETE error:", error);
    return serverError();
  }
}
