import { prisma } from "@/lib/prisma";

export type AppointmentAvailabilityConflictType =
  | "appointment"
  | "unavailability"
  | "no_shift"
  | "day_off";

export interface AppointmentAvailabilityConflict {
  type: AppointmentAvailabilityConflictType;
  detail: string;
}

interface GetAppointmentAvailabilityConflictsArgs {
  tenantId: number;
  staffId: number;
  start: Date;
  end: Date;
  ignoreAppointmentId?: number;
}

export async function getAppointmentAvailabilityConflicts({
  tenantId,
  staffId,
  start,
  end,
  ignoreAppointmentId,
}: GetAppointmentAvailabilityConflictsArgs): Promise<
  AppointmentAvailabilityConflict[]
> {
  const appointmentWhere: Record<string, unknown> = {
    TenantId: tenantId,
    StaffId: staffId,
    IsActive: true,
    Status: { not: 4 },
    StartTime: { lt: end },
    EndTime: { gt: start },
  };

  if (ignoreAppointmentId) {
    appointmentWhere.Id = { not: ignoreAppointmentId };
  }

  const [overlappingAppointments, unavailabilities, shift] = await Promise.all([
    prisma.appointments.findMany({
      where: appointmentWhere,
      select: {
        Id: true,
        Customers: { select: { Name: true, Surname: true } },
        Treatments: { select: { Name: true } },
      },
    }),
    prisma.staffUnavailabilities.findMany({
      where: {
        TenantId: tenantId,
        StaffId: staffId,
        IsActive: true,
        StartTime: { lt: end },
        EndTime: { gt: start },
      },
      select: { Reason: true },
    }),
    prisma.staffShifts.findFirst({
      where: {
        TenantId: tenantId,
        StaffId: staffId,
        DayOfWeek: start.getDay(),
        IsActive: true,
      },
      select: { IsWorkingDay: true },
    }),
  ]);

  const conflicts: AppointmentAvailabilityConflict[] = [];

  for (const appointment of overlappingAppointments) {
    conflicts.push({
      type: "appointment",
      detail: `Randevu #${appointment.Id}: ${appointment.Customers?.Name ?? ""} ${appointment.Customers?.Surname ?? ""} - ${appointment.Treatments?.Name ?? ""}`.trim(),
    });
  }

  for (const unavailability of unavailabilities) {
    conflicts.push({
      type: "unavailability",
      detail: `Müsait değil: ${unavailability.Reason ?? "Bloklu zaman"}`,
    });
  }

  if (!shift) {
    conflicts.push({
      type: "no_shift",
      detail: "Bu gün için tanımlı vardiya bulunmuyor.",
    });
  } else if (!shift.IsWorkingDay) {
    conflicts.push({
      type: "day_off",
      detail: "Bu gün çalışma günü değil.",
    });
  }

  return conflicts;
}

export function getAppointmentAvailabilityError(
  conflicts: AppointmentAvailabilityConflict[],
): { code: string; message: string } {
  const firstConflict = conflicts[0];

  if (!firstConflict) {
    return {
      code: "UNAVAILABLE",
      message: "Seçilen zaman aralığı uygun değil.",
    };
  }

  switch (firstConflict.type) {
    case "appointment":
      return {
        code: "OVERLAP",
        message:
          "Bu personelin seçilen zaman aralığında başka bir randevusu bulunmaktadır.",
      };
    case "no_shift":
      return {
        code: "NO_SHIFT",
        message: "Bu personel için seçilen gün tanımlı vardiya bulunmuyor.",
      };
    case "day_off":
      return {
        code: "DAY_OFF",
        message: "Bu personel seçilen günde çalışmıyor.",
      };
    case "unavailability":
      return {
        code: "UNAVAILABLE",
        message: "Personel seçilen zaman aralığında müsait değil.",
      };
    default:
      return {
        code: "UNAVAILABLE",
        message: "Seçilen zaman aralığı uygun değil.",
      };
  }
}
