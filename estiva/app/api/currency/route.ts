import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

// GET /api/currency — List active currencies
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const currencies = await prisma.currencies.findMany({
      where: { IsActive: true },
      orderBy: { DisplayOrder: "asc" },
    });

    return success(currencies);
  } catch (err) {
    console.error("Currency list error:", err);
    return serverError();
  }
}
