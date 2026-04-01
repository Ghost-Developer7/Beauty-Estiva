import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action !== "summary") {
      return fail("action=summary parametresi gereklidir");
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

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

    // Run all queries in parallel
    const [
      todayAppointments,
      weekAppointments,
      totalCustomers,
      newCustomersThisMonth,
      monthRevenue,
      monthExpenses,
      upcomingAppointments,
      recentPayments,
      staffCount,
    ] = await Promise.all([
      // Today's appointments
      prisma.appointments.count({
        where: {
          TenantId: user!.tenantId,
          IsActive: true,
          StartTime: { gte: startOfToday, lte: endOfToday },
          ...staffFilter,
        },
      }),
      // Week appointments
      prisma.appointments.count({
        where: {
          TenantId: user!.tenantId,
          IsActive: true,
          StartTime: { gte: startOfWeek, lte: endOfWeek },
          ...staffFilter,
        },
      }),
      // Total customers
      prisma.customers.count({
        where: { TenantId: user!.tenantId, IsActive: true },
      }),
      // New customers this month
      prisma.customers.count({
        where: {
          TenantId: user!.tenantId,
          IsActive: true,
          CDate: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      // This month revenue (appointment payments)
      prisma.appointmentPayments.aggregate({
        where: {
          TenantId: user!.tenantId,
          IsActive: true,
          PaidAt: { gte: startOfMonth, lte: endOfMonth },
          ...(isStaff
            ? { Appointments: { StaffId: user!.id } }
            : {}),
        },
        _sum: { AmountInTry: true },
      }),
      // This month expenses
      prisma.expenses.aggregate({
        where: {
          TenantId: user!.tenantId,
          IsActive: true,
          ExpenseDate: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { AmountInTry: true },
      }),
      // Upcoming appointments (next 5)
      prisma.appointments.findMany({
        where: {
          TenantId: user!.tenantId,
          IsActive: true,
          StartTime: { gte: now },
          ...staffFilter,
        },
        include: {
          Customers: { select: { Name: true, Surname: true } },
          Treatments: { select: { Name: true } },
          Users: { select: { Name: true, Surname: true } },
        },
        orderBy: { StartTime: "asc" },
        take: 5,
      }),
      // Recent payments (last 5)
      prisma.appointmentPayments.findMany({
        where: {
          TenantId: user!.tenantId,
          IsActive: true,
          ...(isStaff
            ? { Appointments: { StaffId: user!.id } }
            : {}),
        },
        include: {
          Appointments: {
            include: {
              Customers: { select: { Name: true, Surname: true } },
            },
          },
        },
        orderBy: { PaidAt: "desc" },
        take: 5,
      }),
      // Staff count
      prisma.users.count({
        where: { TenantId: user!.tenantId, IsActive: true },
      }),
    ]);

    return success({
      todayAppointments,
      weekAppointments,
      totalCustomers,
      newCustomersThisMonth,
      totalRevenue: Number(monthRevenue._sum.AmountInTry || 0),
      totalExpenses: Number(monthExpenses._sum.AmountInTry || 0),
      upcomingAppointments: upcomingAppointments.map((a) => ({
        id: a.Id,
        customerName: `${a.Customers.Name} ${a.Customers.Surname}`,
        treatmentName: a.Treatments.Name,
        staffName: `${a.Users.Name} ${a.Users.Surname}`,
        startTime: a.StartTime,
        endTime: a.EndTime,
        status: a.Status,
      })),
      recentPayments: recentPayments.map((p) => ({
        id: p.Id,
        customerName: `${p.Appointments.Customers.Name} ${p.Appointments.Customers.Surname}`,
        amount: p.Amount,
        amountInTry: p.AmountInTry,
        paymentMethod: p.PaymentMethod,
        paidAt: p.PaidAt,
      })),
      staffCount,
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return serverError();
  }
}
