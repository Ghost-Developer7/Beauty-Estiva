import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription, requireRoles } from "@/lib/api-middleware";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/product/[id]
 * Get product by id.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { id } = await context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) return fail("Geçersiz ürün ID.", "VALIDATION_ERROR");

    const product = await prisma.products.findFirst({
      where: {
        Id: productId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!product) return notFound("Ürün bulunamadı.");

    return success({
      id: product.Id,
      name: product.Name,
      description: product.Description,
      barcode: product.Barcode,
      price: product.Price,
      stockQuantity: product.StockQuantity,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return serverError();
  }
}

/**
 * PUT /api/product/[id]
 * Update product (Owner/Admin only).
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) return fail("Geçersiz ürün ID.", "VALIDATION_ERROR");

    const existing = await prisma.products.findFirst({
      where: {
        Id: productId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!existing) return notFound("Ürün bulunamadı.");

    const body = await req.json();
    const { name, description, barcode, price, stockQuantity } = body;

    const updated = await prisma.products.update({
      where: { Id: productId },
      data: {
        ...(name !== undefined && { Name: name }),
        ...(description !== undefined && { Description: description }),
        ...(barcode !== undefined && { Barcode: barcode }),
        ...(price !== undefined && { Price: price }),
        ...(stockQuantity !== undefined && { StockQuantity: stockQuantity }),
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(
      { id: updated.Id, name: updated.Name },
      "Ürün başarıyla güncellendi."
    );
  } catch (error) {
    console.error("Update product error:", error);
    return serverError("Ürün güncellenirken bir hata oluştu.");
  }
}

/**
 * DELETE /api/product/[id]
 * Soft delete product (Owner/Admin only).
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await context.params;
    const productId = parseInt(id);
    if (isNaN(productId)) return fail("Geçersiz ürün ID.", "VALIDATION_ERROR");

    const existing = await prisma.products.findFirst({
      where: {
        Id: productId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!existing) return notFound("Ürün bulunamadı.");

    await prisma.products.update({
      where: { Id: productId },
      data: {
        IsActive: false,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(null, "Ürün başarıyla silindi.");
  } catch (error) {
    console.error("Delete product error:", error);
    return serverError("Ürün silinirken bir hata oluştu.");
  }
}
