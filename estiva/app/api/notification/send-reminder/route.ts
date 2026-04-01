import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";

// POST /api/notification/send-reminder — Send appointment reminder
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const { appointmentId } = body;

    if (!appointmentId) return fail("appointmentId zorunludur");

    const appointment = await prisma.appointments.findFirst({
      where: { Id: appointmentId, TenantId: user!.tenantId, IsActive: true },
      include: {
        Customers: { select: { Id: true, Name: true, Surname: true, Phone: true } },
        Treatments: { select: { Name: true } },
        Users: { select: { Name: true, Surname: true } },
      },
    });

    if (!appointment) return notFound("Randevu bulunamadı");

    if (!appointment.Customers.Phone) {
      return fail("Müşterinin telefon numarası bulunamadı");
    }

    // Create in-app notification
    await prisma.inAppNotifications.create({
      data: {
        TenantId: user!.tenantId,
        UserId: null,
        Title: "Randevu Hatırlatması",
        Message: `${appointment.Customers.Name} ${appointment.Customers.Surname} - ${appointment.Treatments.Name} randevusu: ${new Date(appointment.StartTime).toLocaleString("tr-TR")}`,
        Type: "Reminder",
        EntityType: "Appointment",
        EntityId: appointmentId,
        IsRead: false,
        CUser: user!.id,
        CDate: new Date(),
        IsActive: true,
      },
    });

    return success(
      { appointmentId, customerPhone: appointment.Customers.Phone },
      "Hatırlatma gönderildi"
    );
  } catch (error) {
    console.error("Send reminder error:", error);
    return serverError();
  }
}
