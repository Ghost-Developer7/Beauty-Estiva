import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/expense/category — List expense categories
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const categories = await prisma.expenseCategories.findMany({
      where: {
        TenantId: user!.tenantId,
        IsActive: true,
      },
      orderBy: { Name: "asc" },
    });

    return success(categories);
  } catch (err) {
    console.error("Expense category list error:", err);
    return serverError();
  }
}

// POST /api/expense/category — Create expense category
export async function POST(req: NextRequest) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const body = await req.json();
    const { name, color } = body;

    if (!name) {
      return fail("Kategori adı zorunludur.");
    }

    // Check duplicate name
    const existing = await prisma.expenseCategories.findFirst({
      where: {
        TenantId: user!.tenantId,
        Name: name,
        IsActive: true,
      },
    });

    if (existing) {
      return fail("Bu isimde bir kategori zaten mevcut.", "DUPLICATE");
    }

    const now = new Date();

    const category = await prisma.expenseCategories.create({
      data: {
        TenantId: user!.tenantId,
        Name: name,
        Color: color || null,
        CUser: user!.id,
        CDate: now,
        UUser: user!.id,
        UDate: now,
        IsActive: true,
      },
    });

    return success(category, "Gider kategorisi başarıyla oluşturuldu.");
  } catch (err) {
    console.error("Expense category create error:", err);
    return serverError();
  }
}
