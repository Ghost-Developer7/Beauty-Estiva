import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";

// PUT /api/tenantsettings/appointment-settings — Update appointment settings
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const body = await req.json();
    const { appointmentSlotMinutes, autoConfirmAppointments, bufferMinutes, reminderHourBefore } = body;
    const now = new Date();

    await prisma.tenants.update({
      where: { Id: user!.tenantId },
      data: {
        ...(appointmentSlotMinutes !== undefined && { AppointmentSlotMinutes: appointmentSlotMinutes }),
        ...(autoConfirmAppointments !== undefined && { AutoConfirmAppointments: autoConfirmAppointments }),
        ...(bufferMinutes !== undefined && { BufferMinutes: bufferMinutes }),
        ...(reminderHourBefore !== undefined && { ReminderHourBefore: reminderHourBefore }),
        UUser: user!.id,
        UDate: now,
      },
    });

    return success(null, "Randevu ayarları güncellendi.");
  } catch (error) {
    console.error("Tenant appointment settings PUT error:", error);
    return serverError();
  }
}
