import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const type = req.nextUrl.searchParams.get("type"); // "Receivable" | "Debt" | null

    const where: any = { TenantId: user!.tenantId, IsActive: true };
    if (type) where.Type = type;

    const debts = await prisma.customerDebts.findMany({ where });

    const now = new Date();
    let totalAmount = 0;
    let totalPaid = 0;
    let totalCount = 0;
    let pendingCount = 0;
    let partialCount = 0;
    let paidCount = 0;
    let overdueCount = 0;

    for (const d of debts) {
      const amount = Number(d.Amount);
      const paid = Number(d.PaidAmount);
      totalAmount += amount;
      totalPaid += paid;
      totalCount++;

      const isOverdue = d.DueDate && d.DueDate < now && d.Status !== "Paid";
      if (isOverdue) overdueCount++;
      if (d.Status === "Pending") pendingCount++;
      else if (d.Status === "PartiallyPaid") partialCount++;
      else if (d.Status === "Paid") paidCount++;
    }

    return success({
      totalAmount,
      totalPaid,
      totalRemaining: totalAmount - totalPaid,
      totalCount,
      pendingCount,
      partialCount,
      paidCount,
      overdueCount,
    });
  } catch (err) {
    console.error("Debt summary error:", err);
    return serverError();
  }
}
