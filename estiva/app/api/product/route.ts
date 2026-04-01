import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription, requireRoles } from "@/lib/api-middleware";

/**
 * GET /api/product
 * List products (auth required, subscription required).
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const products = await prisma.products.findMany({
      where: {
        TenantId: user!.tenantId,
        IsActive: true,
      },
      select: {
        Id: true,
        Name: true,
        Description: true,
        Barcode: true,
        Price: true,
        StockQuantity: true,
      },
      orderBy: { Name: "asc" },
    });

    const items = products.map((p) => ({
      id: p.Id,
      name: p.Name,
      description: p.Description,
      barcode: p.Barcode,
      price: p.Price,
      stockQuantity: p.StockQuantity,
    }));

    return success(items);
  } catch (error) {
    console.error("List products error:", error);
    return serverError();
  }
}

/**
 * POST /api/product
 * Create product (Owner/Admin only).
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { name, description, barcode, price, stockQuantity } = body;

    if (!name || price === undefined || price === null) {
      return fail("Ad ve fiyat zorunludur.", "VALIDATION_ERROR");
    }

    const product = await prisma.products.create({
      data: {
        TenantId: user!.tenantId,
        Name: name,
        Description: description || null,
        Barcode: barcode || null,
        Price: price,
        StockQuantity: stockQuantity ?? 0,
        CUser: user!.id,
        CDate: new Date(),
        IsActive: true,
      },
    });

    return success(
      {
        id: product.Id,
        name: product.Name,
        price: product.Price,
        stockQuantity: product.StockQuantity,
      },
      "Ürün başarıyla oluşturuldu."
    );
  } catch (error) {
    console.error("Create product error:", error);
    return serverError("Ürün oluşturulurken bir hata oluştu.");
  }
}
