import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/customerdebt/summary — Debt summary totals
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
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
  } catch (err) {
    console.error("Debt summary error:", err);
    return serverError();
  }
}
