import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/financialreport — Financial reports
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const staffId = searchParams.get("staffId");

    if (!type) {
      return fail("type parametresi zorunludur (dashboard, revenue, expense).");
    }

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    switch (type) {
      case "dashboard": {
        const paymentWhere: any = {
          TenantId: user!.tenantId,
          IsActive: true,
        };
        if (startDate || endDate) paymentWhere.PaidAt = dateFilter;

        const expenseWhere: any = {
          TenantId: user!.tenantId,
          IsActive: true,
        };
        if (startDate || endDate) expenseWhere.ExpenseDate = dateFilter;

        const appointmentWhere: any = {
          TenantId: user!.tenantId,
          IsActive: true,
        };
        if (startDate || endDate) appointmentWhere.StartTime = dateFilter;

        const [revenueAgg, expenseAgg, appointmentCount] = await Promise.all([
          prisma.appointmentPayments.aggregate({
            where: paymentWhere,
            _sum: { AmountInTry: true },
          }),
          prisma.expenses.aggregate({
            where: expenseWhere,
            _sum: { AmountInTry: true },
          }),
          prisma.appointments.count({ where: appointmentWhere }),
        ]);

        const totalRevenue = Number(revenueAgg._sum.AmountInTry || 0);
        const totalExpenses = Number(expenseAgg._sum.AmountInTry || 0);

        return success({
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          appointmentCount,
        });
      }

      case "revenue": {
        const paymentWhere: any = {
          TenantId: user!.tenantId,
          IsActive: true,
        };
        if (startDate || endDate) paymentWhere.PaidAt = dateFilter;

        // Revenue by staff
        const payments = await prisma.appointmentPayments.findMany({
          where: paymentWhere,
          include: {
            Appointments: {
              select: {
                StaffId: true,
                TreatmentId: true,
                Users: { select: { Id: true, Name: true, Surname: true } },
                Treatments: { select: { Id: true, Name: true } },
              },
            },
          },
        });

        // If staffId filter provided, filter payments
        const filteredPayments = staffId
          ? payments.filter((p) => p.Appointments.StaffId === parseInt(staffId))
          : payments;

        // Group by staff
        const byStaff: Record<number, { staffName: string; total: number }> = {};
        const byTreatment: Record<number, { treatmentName: string; total: number }> = {};
        const byMethod: Record<number, { total: number }> = {};

        for (const p of filteredPayments) {
          const sid = p.Appointments.StaffId;
          const tid = p.Appointments.TreatmentId;
          const amt = Number(p.AmountInTry);

          if (!byStaff[sid]) {
            byStaff[sid] = {
              staffName: `${p.Appointments.Users.Name} ${p.Appointments.Users.Surname}`,
              total: 0,
            };
          }
          byStaff[sid].total += amt;

          if (!byTreatment[tid]) {
            byTreatment[tid] = {
              treatmentName: p.Appointments.Treatments.Name,
              total: 0,
            };
          }
          byTreatment[tid].total += amt;

          if (!byMethod[p.PaymentMethod]) {
            byMethod[p.PaymentMethod] = { total: 0 };
          }
          byMethod[p.PaymentMethod].total += amt;
        }

        return success({
          byStaff: Object.entries(byStaff).map(([id, v]) => ({ staffId: parseInt(id), ...v })),
          byTreatment: Object.entries(byTreatment).map(([id, v]) => ({ treatmentId: parseInt(id), ...v })),
          byPaymentMethod: Object.entries(byMethod).map(([method, v]) => ({ paymentMethod: parseInt(method), ...v })),
        });
      }

      case "expense": {
        const expenseWhere: any = {
          TenantId: user!.tenantId,
          IsActive: true,
        };
        if (startDate || endDate) expenseWhere.ExpenseDate = dateFilter;

        const expenses = await prisma.expenses.findMany({
          where: expenseWhere,
          include: {
            ExpenseCategories: { select: { Id: true, Name: true, Color: true } },
          },
        });

        // Group by category
        const byCategory: Record<string, { categoryName: string; color: string | null; total: number; count: number }> = {};

        for (const e of expenses) {
          const catKey = e.ExpenseCategoryId ? String(e.ExpenseCategoryId) : "uncategorized";
          if (!byCategory[catKey]) {
            byCategory[catKey] = {
              categoryName: e.ExpenseCategories?.Name || "Kategorisiz",
              color: e.ExpenseCategories?.Color || null,
              total: 0,
              count: 0,
            };
          }
          byCategory[catKey].total += Number(e.AmountInTry);
          byCategory[catKey].count += 1;
        }

        return success({
          byCategory: Object.entries(byCategory).map(([id, v]) => ({
            categoryId: id === "uncategorized" ? null : parseInt(id),
            ...v,
          })),
          totalExpenses: expenses.reduce((sum, e) => sum + Number(e.AmountInTry), 0),
        });
      }

      default:
        return fail("Geçersiz rapor tipi. Geçerli değerler: dashboard, revenue, expense");
    }
  } catch (err) {
    console.error("Financial report error:", err);
    return serverError();
  }
}
