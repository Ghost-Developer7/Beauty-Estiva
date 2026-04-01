import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

/**
 * POST /api/tenantonboarding/invite-token
 * Create an invite token (Owner/Admin only).
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const { emailToInvite } = body;

    // Generate random 6-char alphanumeric token
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let tokenCode = "";
    for (let i = 0; i < 6; i++) {
      tokenCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Set expiry to 24 hours from now
    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 24);

    const inviteToken = await prisma.tenantInviteTokens.create({
      data: {
        TokenCode: tokenCode,
        EmailToInvite: emailToInvite || null,
        ExpireDate: expireDate,
        IsUsed: false,
        TenantId: user!.tenantId,
        CUser: user!.id,
        CDate: new Date(),
        IsActive: true,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const registerUrl = `${baseUrl}/register?token=${tokenCode}`;

    return success(
      {
        token: tokenCode,
        registerUrl,
        emailSent: false,
      },
      "Davet token'ı oluşturuldu."
    );
  } catch (error) {
    console.error("Create invite token error:", error);
    return serverError("Davet token'ı oluşturulurken bir hata oluştu.");
  }
}
