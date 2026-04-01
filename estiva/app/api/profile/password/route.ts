import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";
import { verifyAspNetIdentityV3Hash, hashPasswordV3 } from "@/lib/password-hasher";
import crypto from "crypto";

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return fail("Mevcut şifre ve yeni şifre gereklidir");
    }

    if (newPassword.length < 6) {
      return fail("Yeni şifre en az 6 karakter olmalıdır");
    }

    const dbUser = await prisma.users.findUnique({
      where: { Id: user!.id },
      select: { PasswordHash: true },
    });

    if (!dbUser || !dbUser.PasswordHash) {
      return fail("Kullanıcı bulunamadı");
    }

    // Verify current password
    const isValid = verifyAspNetIdentityV3Hash(currentPassword, dbUser.PasswordHash);
    if (!isValid) {
      return fail("Mevcut şifre hatalı", "INVALID_PASSWORD", 400);
    }

    // Hash new password
    const newHash = hashPasswordV3(newPassword);
    const newSecurityStamp = crypto.randomUUID();

    await prisma.users.update({
      where: { Id: user!.id },
      data: {
        PasswordHash: newHash,
        SecurityStamp: newSecurityStamp,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(null, "Şifre başarıyla değiştirildi");
  } catch (error) {
    console.error("Password change error:", error);
    return serverError();
  }
}
