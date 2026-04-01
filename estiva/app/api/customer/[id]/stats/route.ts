import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/customer/[id]/stats — Customer statistics
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) return fail("Geçersiz müşteri ID.", "VALIDATION_ERROR");

    const customer = await prisma.customers.findFirst({
      where: { Id: customerId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!customer) return notFound("Müşteri bulunamadı.");

    const [appointmentCount, completedCount, cancelledCount, totalPayments] = await Promise.all([
      prisma.appointments.count({
        where: { CustomerId: customerId, TenantId: user!.tenantId, IsActive: true },
      }),
      prisma.appointments.count({
        where: { CustomerId: customerId, TenantId: user!.tenantId, IsActive: true, Status: 3 },
      }),
      prisma.appointments.count({
        where: { CustomerId: customerId, TenantId: user!.tenantId, IsActive: true, Status: 4 },
      }),
      prisma.appointmentPayments.aggregate({
        where: {
          TenantId: user!.tenantId,
          IsActive: true,
          Appointments: { CustomerId: customerId },
        },
        _sum: { AmountInTry: true },
      }),
    ]);

    return success({
      customerId,
      totalAppointments: appointmentCount,
      completedAppointments: completedCount,
      cancelledAppointments: cancelledCount,
      totalSpent: Number(totalPayments._sum.AmountInTry || 0),
      loyaltyPoints: customer.LoyaltyPoints,
      totalVisits: customer.TotalVisits,
      customerSince: customer.CustomerSince,
      lastVisitDate: customer.LastVisitDate,
    });
  } catch (error) {
    console.error("Customer stats GET error:", error);
    return serverError();
  }
}
