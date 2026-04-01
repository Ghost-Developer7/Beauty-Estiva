import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// POST /api/sms/test — Send test SMS
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { phoneNumber, message } = body;

    if (!phoneNumber) return fail("Telefon numarası gereklidir");

    const smsIntegration = await prisma.tenantSMSIntegrations.findUnique({
      where: { TenantId: user!.tenantId },
    });

    if (!smsIntegration || !smsIntegration.SmsApiKey) {
      return fail("SMS entegrasyonu yapılandırılmamış");
    }

    const smsMessage = message || "Bu bir test SMS mesajıdır.";

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
              text: smsMessage,
              receipts: { number: [phoneNumber] },
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
      return success({ response: result, sentTo: 1 }, "Test SMS gönderildi");
    } catch (smsError) {
      console.error("SMS test error:", smsError);
      return fail("SMS gönderilirken hata oluştu");
    }
  } catch (error) {
    console.error("SMS test POST error:", error);
    return serverError();
  }
}
