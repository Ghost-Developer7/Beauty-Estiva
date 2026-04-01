import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// GET /api/sms/settings — SMS integration settings
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

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
  } catch (error) {
    console.error("SMS settings GET error:", error);
    return serverError();
  }
}

// PUT /api/sms/settings — Update SMS settings
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
    console.error("SMS settings PUT error:", error);
    return serverError();
  }
}
