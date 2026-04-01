import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

// POST /api/exchangerate/refresh — Refresh rates from TCMB
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
      headers: { "Accept": "application/xml" },
    });

    if (!response.ok) {
      return fail("TCMB kur bilgisi alınamadı.", "TCMB_ERROR");
    }

    const xmlText = await response.text();

    const rateMap: Record<string, number> = {};
    const currencyRegex = /<Currency[^>]*CurrencyCode="(\w+)"[^>]*>[\s\S]*?<ForexBuying>([\d.]*)<\/ForexBuying>[\s\S]*?<ForexSelling>([\d.]*)<\/ForexSelling>[\s\S]*?<\/Currency>/g;
    let match;

    while ((match = currencyRegex.exec(xmlText)) !== null) {
      const code = match[1];
      const buying = parseFloat(match[2]);
      const selling = parseFloat(match[3]);
      if (buying && selling) {
        rateMap[code] = (buying + selling) / 2;
      }
    }

    const now = new Date();

    const currenciesToUpdate = await prisma.currencies.findMany({
      where: { IsActive: true, TcmbCurrencyCode: { not: null } },
    });

    let updatedCount = 0;

    for (const currency of currenciesToUpdate) {
      const tcmbCode = currency.TcmbCurrencyCode;
      if (tcmbCode && rateMap[tcmbCode]) {
        await prisma.currencies.update({
          where: { Id: currency.Id },
          data: { ExchangeRateToTry: rateMap[tcmbCode], RateLastUpdated: now },
        });
        updatedCount++;
      }
    }

    await prisma.currencies.updateMany({
      where: { Code: "TRY" },
      data: { ExchangeRateToTry: 1, RateLastUpdated: now },
    });

    return success(
      { updatedCount, rates: rateMap },
      `${updatedCount} para birimi kuru güncellendi.`
    );
  } catch (err) {
    console.error("Exchange rate refresh error:", err);
    return serverError();
  }
}
