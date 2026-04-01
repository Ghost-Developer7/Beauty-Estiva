import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// POST /api/sms/appointment-reminder/[appointmentId] — Send appointment reminder SMS
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { appointmentId } = await params;
    const apptId = parseInt(appointmentId);
    if (isNaN(apptId)) return fail("Geçersiz randevu ID");

    const smsIntegration = await prisma.tenantSMSIntegrations.findUnique({
      where: { TenantId: user!.tenantId },
    });

    if (!smsIntegration || !smsIntegration.SmsApiKey) {
      return fail("SMS entegrasyonu yapılandırılmamış");
    }

    const appointment = await prisma.appointments.findFirst({
      where: { Id: apptId, TenantId: user!.tenantId, IsActive: true },
      include: {
        Customers: { select: { Name: true, Surname: true, Phone: true } },
        Treatments: { select: { Name: true } },
        Users: { select: { Name: true, Surname: true } },
      },
    });

    if (!appointment) return notFound("Randevu bulunamadı");

    if (!appointment.Customers.Phone) {
      return fail("Müşterinin telefon numarası bulunamadı");
    }

    const startTime = new Date(appointment.StartTime).toLocaleString("tr-TR");
    const message = `Sayın ${appointment.Customers.Name} ${appointment.Customers.Surname}, ${startTime} tarihli ${appointment.Treatments.Name} randevunuzu hatırlatmak isteriz.`;

    try {
      const smsPayload = {
        request: {
          authentication: {
            key: smsIntegration.SmsApiKey,
            hash: smsIntegration.SmsApiHash,
          },
          order: {
            sender: smsIntegration.SmsHeader,
            sendDateTime: "",
            message: {
              text: message,
              receipts: { number: [appointment.Customers.Phone] },
            },
          },
        },
      };

      const response = await fetch(
        "https://api.iletimerkezi.com/v1/send-sms/json",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(smsPayload),
        }
      );

      const result = await response.json();
      return success({ response: result, sentTo: 1 }, "Randevu hatırlatma SMS gönderildi");
    } catch (smsError) {
      console.error("SMS reminder error:", smsError);
      return fail("SMS gönderilirken hata oluştu");
    }
  } catch (error) {
    console.error("SMS appointment reminder error:", error);
    return serverError();
  }
}
