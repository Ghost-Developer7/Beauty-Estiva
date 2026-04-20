import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-middleware";
import { hashPasswordV3 } from "@/lib/password-hasher";
import crypto from "crypto";

/**
 * POST /api/tenantonboarding
 * Register a new tenant (public, no auth required).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const companyName = String(body.companyName || "").trim();
    const taxNumber = String(body.taxNumber || "").trim();
    const taxOffice = String(body.taxOffice || "").trim();
    const address = String(body.address || "").trim();
    const phone = String(body.phone || "").trim();
    const ownerEmail = String(body.ownerEmail || "").trim();
    const ownerPassword = String(body.ownerPassword || "");
    const ownerName = String(body.ownerName || "").trim();
    const ownerSurname = String(body.ownerSurname || "").trim();

    if (!companyName || !phone || !ownerEmail || !ownerPassword || !ownerName || !ownerSurname) {
      return fail("Tüm zorunlu alanlar doldurulmalıdır.", "VALIDATION_ERROR");
    }

    const existingUser = await prisma.users.findFirst({
      where: {
        NormalizedEmail: ownerEmail.toUpperCase(),
        IsActive: true,
      },
    });

    if (existingUser) {
      return fail("Bu e-posta adresi zaten kayıtlı.", "EMAIL_EXISTS");
    }

    const tenantUUID = Math.floor(100000 + Math.random() * 900000);
    const passwordHash = hashPasswordV3(ownerPassword);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenants.create({
        data: {
          TenantUUID: tenantUUID,
          CompanyName: companyName,
          TaxNumber: taxNumber || "",
          TaxOffice: taxOffice || "",
          Address: address || "",
          Phone: phone,
          ReminderHourBefore: 24,
          AppointmentSlotMinutes: 30,
          AutoConfirmAppointments: false,
          BufferMinutes: 0,
          Currency: "TRY",
          Timezone: "Europe/Istanbul",
          CDate: new Date(),
          IsActive: true,
        },
      });

      const securityStamp = crypto.randomUUID();
      const concurrencyStamp = crypto.randomUUID();

      const user = await tx.users.create({
        data: {
          Name: ownerName,
          Surname: ownerSurname,
          TenantId: tenant.Id,
          Email: ownerEmail,
          NormalizedEmail: ownerEmail.toUpperCase(),
          UserName: ownerEmail,
          NormalizedUserName: ownerEmail.toUpperCase(),
          PasswordHash: passwordHash,
          SecurityStamp: securityStamp,
          ConcurrencyStamp: concurrencyStamp,
          EmailConfirmed: false,
          PhoneNumberConfirmed: false,
          TwoFactorEnabled: false,
          LockoutEnabled: true,
          AccessFailedCount: 0,
          IsApproved: true,
          IsActive: true,
          CDate: new Date(),
          DefaultCommissionRate: 0,
        },
      });

      let ownerRole = await tx.roles.findFirst({
        where: { NormalizedName: "OWNER" },
      });

      if (!ownerRole) {
        ownerRole = await tx.roles.create({
          data: {
            Name: "Owner",
            NormalizedName: "OWNER",
            ConcurrencyStamp: crypto.randomUUID(),
          },
        });
      }

      await tx.userRoles.create({
        data: {
          UserId: user.Id,
          RoleId: ownerRole.Id,
        },
      });

      return { tenantId: tenant.Id, userId: user.Id };
    });

    return success(result, "Kayıt başarıyla tamamlandı.");
  } catch (error) {
    console.error("Tenant onboarding error:", error);
    return serverError("Kayıt sırasında bir hata oluştu.");
  }
}

/**
 * GET /api/tenantonboarding
 * Get tenant info (auth required).
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const tenant = await prisma.tenants.findFirst({
      where: {
        Id: user!.tenantId,
        IsActive: true,
      },
      select: {
        Id: true,
        TenantUUID: true,
        CompanyName: true,
        TaxNumber: true,
        TaxOffice: true,
        Address: true,
        Phone: true,
        Currency: true,
        Timezone: true,
        SubscriptionPlanId: true,
        CDate: true,
      },
    });

    if (!tenant) {
      return fail("Tenant bulunamadı.", "NOT_FOUND", 404);
    }

    return success(tenant);
  } catch (error) {
    console.error("Get tenant info error:", error);
    return serverError();
  }
}
