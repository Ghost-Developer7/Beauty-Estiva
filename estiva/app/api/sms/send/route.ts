import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// POST /api/sms/send — Send single SMS
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { phoneNumber, phone, message } = body;

    const targetPhone = phoneNumber || phone || "";
    if (!targetPhone) return fail("Telefon numarası gereklidir");
    if (!message) return fail("Mesaj gereklidir");

    const smsIntegration = await prisma.tenantSMSIntegrations.findUnique({
      where: { TenantId: user!.tenantId },
    });

    if (!smsIntegration || !smsIntegration.SmsApiKey) {
      return fail("SMS entegrasyonu yapılandırılmamış");
    }

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
              receipts: { number: [targetPhone] },
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
      return success({ response: result, sentTo: 1 }, "SMS gönderildi");
    } catch (smsError) {
      console.error("SMS send error:", smsError);
      return fail("SMS gönderilirken hata oluştu");
    }
  } catch (error) {
    console.error("SMS send POST error:", error);
    return serverError();
  }
}
