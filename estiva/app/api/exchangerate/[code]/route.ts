import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

// GET /api/exchangerate/[code] — Rate for specific currency
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { code } = await params;

    const currency = await prisma.currencies.findFirst({
      where: { Code: code.toUpperCase(), IsActive: true },
      select: {
        Id: true,
        Code: true,
        Symbol: true,
        Name: true,
        ExchangeRateToTry: true,
        RateLastUpdated: true,
        IsDefault: true,
      },
    });

    if (!currency) return notFound("Para birimi bulunamadı.");

    return success(currency);
  } catch (err) {
    console.error("Exchange rate by code error:", err);
    return serverError();
  }
}
