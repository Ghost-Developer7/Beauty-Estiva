import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireAuth, requireRoles } from "@/lib/api-middleware";

/**
 * GET /api/tenantsettings
 * Get all tenant settings (auth required).
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
    });

    if (!tenant) {
      return fail("Tenant bulunamadı.", "NOT_FOUND", 404);
    }

    // Parse JSON fields safely
    let workingHours = null;
    let holidays = null;

    try {
      workingHours = tenant.WorkingHoursJson ? JSON.parse(tenant.WorkingHoursJson) : null;
    } catch {
      workingHours = null;
    }

    try {
      holidays = tenant.HolidaysJson ? JSON.parse(tenant.HolidaysJson) : null;
    } catch {
      holidays = null;
    }

    // Get notification rules
    const notificationRules = await prisma.tenantNotificationRules.findMany({
      where: {
        TenantId: user!.tenantId,
      },
      select: {
        Id: true,
        Channel: true,
        IsActive: true,
      },
    });

    const settings = {
      profile: {
        companyName: tenant.CompanyName,
        taxNumber: tenant.TaxNumber,
        taxOffice: tenant.TaxOffice,
        address: tenant.Address,
        phone: tenant.Phone,
        currency: tenant.Currency,
        timezone: tenant.Timezone,
      },
      workingHours,
      holidays,
      appointmentSettings: {
        appointmentSlotMinutes: tenant.AppointmentSlotMinutes,
        autoConfirmAppointments: tenant.AutoConfirmAppointments,
        bufferMinutes: tenant.BufferMinutes,
        reminderHourBefore: tenant.ReminderHourBefore,
      },
      notificationRules,
    };

    return success(settings);
  } catch (error) {
    console.error("Get tenant settings error:", error);
    return serverError();
  }
}

/**
 * PUT /api/tenantsettings
 * Update tenant settings (Owner/Admin only).
 */
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { section, data } = body;

    if (!section || !data) {
      return fail("Section ve data alanları zorunludur.", "VALIDATION_ERROR");
    }

    const now = new Date();

    switch (section) {
      case "profile": {
        const { companyName, taxNumber, taxOffice, address, phone } = data;
        await prisma.tenants.update({
          where: { Id: user!.tenantId },
          data: {
            ...(companyName !== undefined && { CompanyName: companyName }),
            ...(taxNumber !== undefined && { TaxNumber: taxNumber }),
            ...(taxOffice !== undefined && { TaxOffice: taxOffice }),
            ...(address !== undefined && { Address: address }),
            ...(phone !== undefined && { Phone: phone }),
            UUser: user!.id,
            UDate: now,
          },
        });
        break;
      }

      case "working-hours": {
        const { workingHoursJson } = data;
        await prisma.tenants.update({
          where: { Id: user!.tenantId },
          data: {
            WorkingHoursJson: JSON.stringify(workingHoursJson),
            UUser: user!.id,
            UDate: now,
          },
        });
        break;
      }

      case "holidays": {
        const { holidaysJson } = data;
        await prisma.tenants.update({
          where: { Id: user!.tenantId },
          data: {
            HolidaysJson: JSON.stringify(holidaysJson),
            UUser: user!.id,
            UDate: now,
          },
        });
        break;
      }

      case "appointment-settings": {
        const {
          appointmentSlotMinutes,
          autoConfirmAppointments,
          bufferMinutes,
          reminderHourBefore,
        } = data;
        await prisma.tenants.update({
          where: { Id: user!.tenantId },
          data: {
            ...(appointmentSlotMinutes !== undefined && {
              AppointmentSlotMinutes: appointmentSlotMinutes,
            }),
            ...(autoConfirmAppointments !== undefined && {
              AutoConfirmAppointments: autoConfirmAppointments,
            }),
            ...(bufferMinutes !== undefined && { BufferMinutes: bufferMinutes }),
            ...(reminderHourBefore !== undefined && {
              ReminderHourBefore: reminderHourBefore,
            }),
            UUser: user!.id,
            UDate: now,
          },
        });
        break;
      }

      case "notification-settings": {
        const { rules } = data;
        if (!Array.isArray(rules)) {
          return fail("Rules bir dizi olmalıdır.", "VALIDATION_ERROR");
        }

        for (const rule of rules) {
          const existing = await prisma.tenantNotificationRules.findFirst({
            where: {
              TenantId: user!.tenantId,
              Channel: rule.channel,
            },
          });

          if (existing) {
            await prisma.tenantNotificationRules.update({
              where: { Id: existing.Id },
              data: {
                IsActive: rule.isActive,
                UUser: user!.id,
                UDate: now,
              },
            });
          } else {
            await prisma.tenantNotificationRules.create({
              data: {
                TenantId: user!.tenantId,
                Channel: rule.channel,
                IsActive: rule.isActive,
                CUser: user!.id,
                CDate: now,
              },
            });
          }
        }
        break;
      }

      default:
        return fail(
          "Geçersiz section. Geçerli değerler: profile, working-hours, holidays, appointment-settings, notification-settings",
          "VALIDATION_ERROR"
        );
    }

    return success(null, "Ayarlar başarıyla güncellendi.");
  } catch (error) {
    console.error("Update tenant settings error:", error);
    return serverError("Ayarlar güncellenirken bir hata oluştu.");
  }
}
