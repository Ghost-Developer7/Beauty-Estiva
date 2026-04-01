import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const now = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0,0,0,0);
    const endOfToday = new Date(now); endOfToday.setHours(23,59,59,999);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate()+6); endOfWeek.setHours(23,59,59,999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999);

    const isStaff = user!.roles.includes("Staff") && !user!.roles.includes("Owner") && !user!.roles.includes("Admin");
    const staffFilter = isStaff ? { StaffId: user!.id } : {};

    const [todayAppts, weekAppts, totalCust, newCust, revenue, expenses, upcoming, payments, staff] = await Promise.all([
      prisma.appointments.count({ where: { TenantId: user!.tenantId, IsActive: true, StartTime: { gte: startOfToday, lte: endOfToday }, ...staffFilter } }),
      prisma.appointments.count({ where: { TenantId: user!.tenantId, IsActive: true, StartTime: { gte: startOfWeek, lte: endOfWeek }, ...staffFilter } }),
      prisma.customers.count({ where: { TenantId: user!.tenantId, IsActive: true } }),
      prisma.customers.count({ where: { TenantId: user!.tenantId, IsActive: true, CDate: { gte: startOfMonth, lte: endOfMonth } } }),
      prisma.appointmentPayments.aggregate({ where: { TenantId: user!.tenantId, IsActive: true, PaidAt: { gte: startOfMonth, lte: endOfMonth }, ...(isStaff ? { Appointments: { StaffId: user!.id } } : {}) }, _sum: { AmountInTry: true } }),
      prisma.expenses.aggregate({ where: { TenantId: user!.tenantId, IsActive: true, ExpenseDate: { gte: startOfMonth, lte: endOfMonth } }, _sum: { AmountInTry: true } }),
      prisma.appointments.findMany({ where: { TenantId: user!.tenantId, IsActive: true, StartTime: { gte: now }, ...staffFilter }, include: { Customers: { select: { Name: true, Surname: true } }, Treatments: { select: { Name: true } }, Users: { select: { Name: true, Surname: true } } }, orderBy: { StartTime: "asc" }, take: 5 }),
      prisma.appointmentPayments.findMany({ where: { TenantId: user!.tenantId, IsActive: true, ...(isStaff ? { Appointments: { StaffId: user!.id } } : {}) }, include: { Appointments: { include: { Customers: { select: { Name: true, Surname: true } } } } }, orderBy: { PaidAt: "desc" }, take: 5 }),
      prisma.users.count({ where: { TenantId: user!.tenantId, IsActive: true } }),
    ]);

    return success({
      todayAppointments: todayAppts, weekAppointments: weekAppts, totalCustomers: totalCust, newCustomersThisMonth: newCust,
      totalRevenue: Number(revenue._sum.AmountInTry || 0), totalExpenses: Number(expenses._sum.AmountInTry || 0),
      upcomingAppointments: upcoming.map(a => ({ id: a.Id, customerName: a.Customers.Name + " " + a.Customers.Surname, treatmentName: a.Treatments.Name, staffName: a.Users.Name + " " + a.Users.Surname, startTime: a.StartTime, endTime: a.EndTime, status: a.Status })),
      recentPayments: payments.map(p => ({ id: p.Id, customerName: p.Appointments.Customers.Name + " " + p.Appointments.Customers.Surname, amount: p.Amount, amountInTry: p.AmountInTry, paymentMethod: p.PaymentMethod, paidAt: p.PaidAt })),
      staffCount: staff,
    });
  } catch (e) { console.error("Dashboard summary error:", e); return serverError(); }
}
