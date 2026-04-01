import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const now = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const isStaff = user!.roles.includes("Staff") && !user!.roles.includes("Owner") && !user!.roles.includes("Admin");
    const staffFilter = isStaff ? { StaffId: user!.id } : {};
    const tenantId = user!.tenantId;

    const [
      todayApptsCount, upcomingApptsCount, weekRevenue, monthRevenue, monthExpenses,
      totalCustomers, activePackages, todaySchedule, statusCounts,
      topServicesRaw, topStaffRaw,
    ] = await Promise.all([
      prisma.appointments.count({ where: { TenantId: tenantId, IsActive: true, StartTime: { gte: startOfToday, lte: endOfToday }, ...staffFilter } }),
      prisma.appointments.count({ where: { TenantId: tenantId, IsActive: true, StartTime: { gte: now }, Status: { in: [1, 2] }, ...staffFilter } }),
      prisma.appointmentPayments.aggregate({ where: { TenantId: tenantId, IsActive: true, PaidAt: { gte: startOfWeek, lte: endOfWeek }, ...(isStaff ? { Appointments: { StaffId: user!.id } } : {}) }, _sum: { AmountInTry: true } }),
      prisma.appointmentPayments.aggregate({ where: { TenantId: tenantId, IsActive: true, PaidAt: { gte: startOfMonth, lte: endOfMonth }, ...(isStaff ? { Appointments: { StaffId: user!.id } } : {}) }, _sum: { AmountInTry: true } }),
      prisma.expenses.aggregate({ where: { TenantId: tenantId, IsActive: true, ExpenseDate: { gte: startOfMonth, lte: endOfMonth } }, _sum: { AmountInTry: true } }),
      prisma.customers.count({ where: { TenantId: tenantId, IsActive: true } }),
      prisma.packageSales_Packages.count({ where: { TenantId: tenantId, IsActive: true, Status: 1 } }),
      prisma.appointments.findMany({
        where: { TenantId: tenantId, IsActive: true, StartTime: { gte: startOfToday, lte: endOfToday }, ...staffFilter },
        include: { Customers: { select: { Name: true, Surname: true } }, Treatments: { select: { Name: true, Color: true } }, Users: { select: { Name: true, Surname: true } } },
        orderBy: { StartTime: "asc" },
      }),
      prisma.appointments.groupBy({ by: ["Status"], where: { TenantId: tenantId, IsActive: true, StartTime: { gte: startOfMonth, lte: endOfMonth }, ...staffFilter }, _count: true }),
      prisma.appointmentPayments.findMany({ where: { TenantId: tenantId, IsActive: true, PaidAt: { gte: startOfMonth, lte: endOfMonth } }, include: { Appointments: { include: { Treatments: { select: { Name: true } } } } } }),
      prisma.appointmentPayments.findMany({ where: { TenantId: tenantId, IsActive: true, PaidAt: { gte: startOfMonth, lte: endOfMonth } }, include: { Appointments: { include: { Users: { select: { Name: true, Surname: true } } } } } }),
    ]);

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; revenue: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const mKey = `${mStart.getFullYear()}-${String(mStart.getMonth() + 1).padStart(2, "0")}`;
      const [rev, exp] = await Promise.all([
        prisma.appointmentPayments.aggregate({ where: { TenantId: tenantId, IsActive: true, PaidAt: { gte: mStart, lte: mEnd } }, _sum: { AmountInTry: true } }),
        prisma.expenses.aggregate({ where: { TenantId: tenantId, IsActive: true, ExpenseDate: { gte: mStart, lte: mEnd } }, _sum: { AmountInTry: true } }),
      ]);
      monthlyTrend.push({ month: mKey, revenue: Number(rev._sum.AmountInTry || 0), expense: Number(exp._sum.AmountInTry || 0) });
    }

    // Customer growth (last 6 months)
    const customerGrowth: { month: string; newCustomers: number; totalCustomers: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const mKey = `${mStart.getFullYear()}-${String(mStart.getMonth() + 1).padStart(2, "0")}`;
      const [newC, totalC] = await Promise.all([
        prisma.customers.count({ where: { TenantId: tenantId, IsActive: true, CDate: { gte: mStart, lte: mEnd } } }),
        prisma.customers.count({ where: { TenantId: tenantId, IsActive: true, CDate: { lte: mEnd } } }),
      ]);
      customerGrowth.push({ month: mKey, newCustomers: newC, totalCustomers: totalC });
    }

    // Status distribution
    const statusMap: Record<number, string> = { 1: "scheduled", 2: "confirmed", 3: "completed", 4: "cancelled", 5: "noShow" };
    const statusDistribution = { scheduled: 0, confirmed: 0, completed: 0, cancelled: 0, noShow: 0, total: 0 };
    for (const s of statusCounts) {
      const key = statusMap[s.Status] as keyof typeof statusDistribution;
      if (key) statusDistribution[key] = s._count;
      statusDistribution.total += s._count;
    }

    // Top services
    const serviceMap = new Map<string, number>();
    for (const p of topServicesRaw) { const n = p.Appointments.Treatments.Name; serviceMap.set(n, (serviceMap.get(n) || 0) + Number(p.AmountInTry)); }
    const topServices = Array.from(serviceMap.entries()).map(([label, amountInTry]) => ({ label, count: 0, amountInTry })).sort((a, b) => b.amountInTry - a.amountInTry).slice(0, 5);

    // Top staff
    const staffMap = new Map<string, number>();
    for (const p of topStaffRaw) { const n = `${p.Appointments.Users.Name} ${p.Appointments.Users.Surname}`; staffMap.set(n, (staffMap.get(n) || 0) + Number(p.AmountInTry)); }
    const topStaff = Array.from(staffMap.entries()).map(([label, amountInTry]) => ({ label, count: 0, amountInTry })).sort((a, b) => b.amountInTry - a.amountInTry).slice(0, 5);

    // Today schedule formatted
    const todayScheduleFormatted = todaySchedule.map((a) => ({
      id: a.Id,
      time: a.StartTime.toISOString(),
      customerName: `${a.Customers.Name} ${a.Customers.Surname}`,
      treatmentName: a.Treatments.Name,
      staffName: `${a.Users.Name} ${a.Users.Surname}`,
      status: statusMap[a.Status] || "scheduled",
      treatmentColor: a.Treatments.Color || null,
    }));

    return success({
      todayAppointmentsCount: todayApptsCount,
      upcomingAppointments: upcomingApptsCount,
      thisWeekRevenue: Number(weekRevenue._sum.AmountInTry || 0),
      thisMonthRevenue: Number(monthRevenue._sum.AmountInTry || 0),
      thisMonthExpense: Number(monthExpenses._sum.AmountInTry || 0),
      totalCustomers,
      activePackages,
      monthlyTrend,
      topServices,
      topStaff,
      customerGrowth,
      statusDistribution,
      todaySchedule: todayScheduleFormatted,
    });
  } catch (e) {
    console.error("Dashboard summary error:", e);
    return serverError();
  }
}
