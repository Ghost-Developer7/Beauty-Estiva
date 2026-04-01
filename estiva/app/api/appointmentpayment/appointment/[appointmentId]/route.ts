import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/appointmentpayment/appointment/[appointmentId] — Payments for appointment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const { appointmentId } = await params;
    const apptId = parseInt(appointmentId);
    if (isNaN(apptId)) return fail("Geçersiz randevu ID.");

    const payments = await prisma.appointmentPayments.findMany({
      where: {
        AppointmentId: apptId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
      include: {
        Currencies: {
          select: { Id: true, Code: true, Symbol: true, Name: true },
        },
      },
      orderBy: { PaidAt: "desc" },
    });

    return success(payments);
  } catch (err) {
    console.error("Appointment payments GET error:", err);
    return serverError();
  }
}
