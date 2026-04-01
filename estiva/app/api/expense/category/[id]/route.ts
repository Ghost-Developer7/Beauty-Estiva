import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/expense/category/[id] — Get expense category detail
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz kategori ID.");

    const category = await prisma.expenseCategories.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!category) return notFound("Kategori bulunamadı.");

    return success(category);
  } catch (err) {
    console.error("Expense category detail error:", err);
    return serverError();
  }
}

// PUT /api/expense/category/[id] — Update expense category
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz kategori ID.");

    const existing = await prisma.expenseCategories.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Kategori bulunamadı.");

    const body = await req.json();
    const { name, color } = body;

    // Check duplicate name (excluding self)
    if (name) {
      const duplicate = await prisma.expenseCategories.findFirst({
        where: {
          TenantId: user!.tenantId,
          Name: name,
          IsActive: true,
          Id: { not: id },
        },
      });
      if (duplicate) return fail("Bu isimde bir kategori zaten mevcut.", "DUPLICATE");
    }

    const updated = await prisma.expenseCategories.update({
      where: { Id: id },
      data: {
        Name: name ?? existing.Name,
        Color: color !== undefined ? color : existing.Color,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(updated, "Kategori başarıyla güncellendi.");
  } catch (err) {
    console.error("Expense category update error:", err);
    return serverError();
  }
}

// DELETE /api/expense/category/[id] — Soft delete expense category
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz kategori ID.");

    const existing = await prisma.expenseCategories.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Kategori bulunamadı.");

    await prisma.expenseCategories.update({
      where: { Id: id },
      data: { IsActive: false, UUser: user!.id, UDate: new Date() },
    });

    return success(null, "Kategori başarıyla silindi.");
  } catch (err) {
    console.error("Expense category delete error:", err);
    return serverError();
  }
}
