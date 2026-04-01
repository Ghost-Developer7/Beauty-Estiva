import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAspNetIdentityV3Hash } from "@/lib/password-hasher";
import { success, fail, serverError } from "@/lib/api-response";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return fail("Email/kullanıcı adı ve şifre gereklidir.");
    }

    const normalizedInput = emailOrUsername.trim().toUpperCase();

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { NormalizedEmail: normalizedInput },
          { NormalizedUserName: normalizedInput },
        ],
        IsActive: true,
      },
      include: {
        UserRoles: {
          include: {
            Roles: true,
          },
        },
      },
    });

    if (!user || !user.PasswordHash) {
      return fail("Geçersiz kullanıcı adı/email veya şifre.", "INVALID_CREDENTIALS", 401);
    }

    // Check lockout
    if (user.LockoutEnabled && user.LockoutEnd) {
      const lockoutEnd = new Date(user.LockoutEnd);
      if (lockoutEnd > new Date()) {
        return fail("Hesabınız geçici olarak kilitlendi. Lütfen birkaç dakika sonra tekrar deneyin.", "ACCOUNT_LOCKED", 423);
      }
    }

    // Check approval
    if (!user.IsApproved) {
      return fail("Hesabınız henüz onaylanmamış.", "NOT_APPROVED", 403);
    }

    // Verify password
    const isValid = verifyAspNetIdentityV3Hash(password, user.PasswordHash);

    if (!isValid) {
      // Increment failed count
      const newCount = user.AccessFailedCount + 1;
      await prisma.users.update({
        where: { Id: user.Id },
        data: {
          AccessFailedCount: newCount,
          ...(newCount >= 5
            ? { LockoutEnd: new Date(Date.now() + 5 * 60 * 1000) }
            : {}),
        },
      });
      return fail("Geçersiz kullanıcı adı/email veya şifre.", "INVALID_CREDENTIALS", 401);
    }

    // Reset failed count on success
    if (user.AccessFailedCount > 0) {
      await prisma.users.update({
        where: { Id: user.Id },
        data: { AccessFailedCount: 0, LockoutEnd: null },
      });
    }

    const roles = user.UserRoles.map((ur) => ur.Roles.Name).filter(Boolean) as string[];

    // Generate JWT token compatible with the existing frontend
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

    const token = await new SignJWT({
      sub: String(user.Id),
      tenantId: String(user.TenantId),
      email: user.Email || "",
      unique_name: user.UserName || "",
      role: roles.length === 1 ? roles[0] : roles,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .setIssuer("BeautyWiseAPI")
      .setAudience("BeautyWiseApp")
      .sign(secret);

    return success({
      token,
      name: user.Name,
      surname: user.Surname,
      email: user.Email || "",
      roles,
    });
  } catch (error) {
    console.error("Login error:", error);
    return serverError();
  }
}
