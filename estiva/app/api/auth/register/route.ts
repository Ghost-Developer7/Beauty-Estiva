import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPasswordV3 } from "@/lib/password-hasher";
import { success, fail, serverError } from "@/lib/api-response";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inviteToken, email, password, confirmPassword, name, surname, birthDate } = body;

    // Validations
    if (!inviteToken || !email || !password || !name || !surname) {
      return fail("Tüm zorunlu alanlar doldurulmalıdır.");
    }

    if (password !== confirmPassword) {
      return fail("Şifreler eşleşmiyor.");
    }

    if (password.length < 8) {
      return fail("Şifre en az 8 karakter olmalıdır.");
    }

    // Validate password complexity
    if (!/[a-z]/.test(password)) return fail("Şifre en az bir küçük harf içermelidir.");
    if (!/[A-Z]/.test(password)) return fail("Şifre en az bir büyük harf içermelidir.");
    if (!/[0-9]/.test(password)) return fail("Şifre en az bir rakam içermelidir.");
    if (!/[^a-zA-Z0-9]/.test(password)) return fail("Şifre en az bir özel karakter içermelidir.");

    // Validate invite token
    const token = await prisma.tenantInviteTokens.findFirst({
      where: {
        TokenCode: inviteToken.trim(),
        IsUsed: false,
        IsActive: true,
        ExpireDate: { gte: new Date() },
      },
    });

    if (!token) {
      return fail("Geçersiz veya süresi dolmuş davet kodu.", "INVALID_TOKEN");
    }

    // Check email uniqueness
    const normalizedEmail = email.trim().toUpperCase();
    const existingUser = await prisma.users.findFirst({
      where: { NormalizedEmail: normalizedEmail },
    });

    if (existingUser) {
      return fail("Bu email adresi zaten kayıtlı.", "EMAIL_EXISTS");
    }

    // Ensure "Staff" role exists
    let staffRole = await prisma.roles.findFirst({
      where: { NormalizedName: "STAFF" },
    });

    if (!staffRole) {
      staffRole = await prisma.roles.create({
        data: {
          Name: "Staff",
          NormalizedName: "STAFF",
          ConcurrencyStamp: crypto.randomUUID(),
        },
      });
    }

    // Hash password (ASP.NET Identity V3 compatible)
    const passwordHash = hashPasswordV3(password);

    // Create user with transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: {
          Name: name.trim(),
          Surname: surname.trim(),
          Email: email.trim(),
          NormalizedEmail: normalizedEmail,
          UserName: email.trim(),
          NormalizedUserName: normalizedEmail,
          PasswordHash: passwordHash,
          SecurityStamp: crypto.randomUUID(),
          ConcurrencyStamp: crypto.randomUUID(),
          TenantId: token.TenantId,
          BirthDate: birthDate ? new Date(birthDate) : null,
          IsActive: true,
          IsApproved: true,
          EmailConfirmed: false,
          PhoneNumberConfirmed: false,
          TwoFactorEnabled: false,
          LockoutEnabled: true,
          AccessFailedCount: 0,
          DefaultCommissionRate: 0,
          CDate: new Date(),
        },
      });

      // Assign Staff role
      await tx.userRoles.create({
        data: {
          UserId: newUser.Id,
          RoleId: staffRole!.Id,
        },
      });

      // Mark invite token as used
      await tx.tenantInviteTokens.update({
        where: { Id: token.Id },
        data: { IsUsed: true, UDate: new Date() },
      });

      return newUser.Id;
    });

    return success(result, "Kayıt başarılı.");
  } catch (error) {
    console.error("Register error:", error);
    return serverError();
  }
}
