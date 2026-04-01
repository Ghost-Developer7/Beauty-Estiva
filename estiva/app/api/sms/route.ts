import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "settings") {
      const smsIntegration = await prisma.tenantSMSIntegrations.findUnique({
        where: { TenantId: user!.tenantId },
      });

      if (!smsIntegration) return success(null);

      return success({
        id: smsIntegration.Id,
        smsProvider: smsIntegration.SmsProvider,
        smsHeader: smsIntegration.SmsHeader,
        smsApiUser: smsIntegration.SmsApiUser,
        hasSmsApiKey: !!smsIntegration.SmsApiKey,
        hasSmsApiHash: !!smsIntegration.SmsApiHash,
        creditBalance: smsIntegration.CreditBalance,
        creditBalanceUpdatedAt: smsIntegration.CreditBalanceUpdatedAt,
        isActive: smsIntegration.IsActive,
      });
    }

    if (action === "balance") {
      const smsIntegration = await prisma.tenantSMSIntegrations.findUnique({
        where: { TenantId: user!.tenantId },
      });

      if (!smsIntegration) return fail("SMS entegrasyonu bulunamadı");

      return success({
        creditBalance: smsIntegration.CreditBalance,
        creditBalanceUpdatedAt: smsIntegration.CreditBalanceUpdatedAt,
      });
    }

    return fail("action parametresi gereklidir (settings, balance)");
  } catch (error) {
    console.error("SMS GET error:", error);
    return serverError();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { smsProvider, smsHeader, smsApiUser, smsApiKey, smsApiHash } = body;
    const now = new Date();

    const existing = await prisma.tenantSMSIntegrations.findUnique({
      where: { TenantId: user!.tenantId },
    });

    if (existing) {
      const data: any = { UUser: user!.id, UDate: now };
      if (smsProvider !== undefined) data.SmsProvider = smsProvider;
      if (smsHeader !== undefined) data.SmsHeader = smsHeader;
      if (smsApiUser !== undefined) data.SmsApiUser = smsApiUser;
      if (smsApiKey !== undefined) data.SmsApiKey = smsApiKey;
      if (smsApiHash !== undefined) data.SmsApiHash = smsApiHash;

      await prisma.tenantSMSIntegrations.update({
        where: { TenantId: user!.tenantId },
        data,
      });
    } else {
      await prisma.tenantSMSIntegrations.create({
        data: {
          TenantId: user!.tenantId,
          SmsProvider: smsProvider || null,
          SmsHeader: smsHeader || null,
          SmsApiUser: smsApiUser || null,
          SmsApiKey: smsApiKey || null,
          SmsApiHash: smsApiHash || null,
          CreditBalance: 0,
          CUser: user!.id,
          CDate: now,
          IsActive: true,
        },
      });
    }

    return success(null, "SMS ayarları güncellendi");
  } catch (error) {
    console.error("SMS PUT error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { action } = body;

    const smsIntegration = await prisma.tenantSMSIntegrations.findUnique({
      where: { TenantId: user!.tenantId },
    });

    if (!smsIntegration || !smsIntegration.SmsApiKey) {
      return fail("SMS entegrasyonu yapılandırılmamış");
    }

    if (action === "send" || action === "send-bulk" || action === "test" || action === "appointment-reminder") {
      const { recipients, message, phoneNumber } = body;

      let phones: string[] = [];
      let smsMessage = message || "";

      if (action === "test") {
        phones = [phoneNumber || ""];
        smsMessage = message || "Bu bir test SMS mesajıdır.";
      } else if (action === "send") {
        phones = [phoneNumber || body.phone || ""];
      } else if (action === "send-bulk") {
        phones = recipients || [];
      } else if (action === "appointment-reminder") {
        phones = recipients || [];
      }

      if (phones.length === 0 || !phones[0]) {
        return fail("Telefon numarası gereklidir");
      }

      // Send via IletiMerkezi API
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
                receipts: {
                  number: phones,
                },
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

        return success(
          { response: result, sentTo: phones.length },
          "SMS gönderildi"
        );
      } catch (smsError) {
        console.error("SMS send error:", smsError);
        return fail("SMS gönderilirken hata oluştu");
      }
    }

    return fail("Geçersiz action");
  } catch (error) {
    console.error("SMS POST error:", error);
    return serverError();
  }
}
