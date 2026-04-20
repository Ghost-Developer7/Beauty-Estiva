import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { paginatedResponse, getPaginationParams } from "@/lib/pagination";
import {
  getAppointmentAvailabilityConflicts,
  getAppointmentAvailabilityError,
} from "@/lib/appointment-availability";

const APPOINTMENT_STATUS_MAP: Record<number, string> = {
  1: "Scheduled",
  2: "Confirmed",
  3: "Completed",
  4: "Cancelled",
  5: "NoShow",
};

const appointmentListInclude = {
  Customers: {
    select: { Id: true, Name: true, Surname: true, Phone: true },
  },
  Users: {
    select: { Id: true, Name: true, Surname: true },
  },
  Treatments: {
    select: { Id: true, Name: true, DurationMinutes: true, Color: true },
  },
} satisfies Prisma.AppointmentsInclude;

type AppointmentListRecord = Prisma.AppointmentsGetPayload<{
  include: typeof appointmentListInclude;
}>;

function mapAppointmentToListItem(appointment: AppointmentListRecord) {
  return {
    id: appointment.Id,
    customerId: appointment.CustomerId,
    customerFullName: appointment.Customers
      ? `${appointment.Customers.Name} ${appointment.Customers.Surname}`
      : "",
    customerPhone: appointment.Customers?.Phone || "",
    staffId: appointment.StaffId,
    staffFullName: appointment.Users
      ? `${appointment.Users.Name} ${appointment.Users.Surname}`
      : "",
    treatmentId: appointment.TreatmentId,
    treatmentName: appointment.Treatments?.Name || "",
    treatmentColor: appointment.Treatments?.Color || null,
    durationMinutes: appointment.Treatments?.DurationMinutes || 0,
    startTime: appointment.StartTime,
    endTime: appointment.EndTime,
    status: APPOINTMENT_STATUS_MAP[appointment.Status] || "Scheduled",
    notes: appointment.Notes,
    isRecurring: appointment.IsRecurring || false,
    sessionNumber: appointment.SessionNumber || 1,
    totalSessions: appointment.TotalSessions || null,
    parentAppointmentId: appointment.ParentAppointmentId || null,
  };
}

// GET /api/appointment - List appointments with filters
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const pageParam = searchParams.get("page") || searchParams.get("pageNumber");
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const staffId = searchParams.get("staffId");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      TenantId: user!.tenantId,
      IsActive: true,
    };

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00+03:00`);
      where.StartTime = { ...(where.StartTime as object), gte: start };
    }
    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999+03:00`);
      where.StartTime = { ...(where.StartTime as object), lte: end };
    }
    if (staffId) {
      where.StaffId = parseInt(staffId, 10);
    }
    if (customerId) {
      where.CustomerId = parseInt(customerId, 10);
    }
    if (status) {
      where.Status = parseInt(status, 10);
    }

    if (!pageParam) {
      const appointments = await prisma.appointments.findMany({
        where,
        orderBy: { StartTime: "desc" },
        include: appointmentListInclude,
      });

      return success(appointments.map(mapAppointmentToListItem));
    }

    const [appointments, totalCount] = await Promise.all([
      prisma.appointments.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { StartTime: "desc" },
        include: appointmentListInclude,
      }),
      prisma.appointments.count({ where }),
    ]);

    return success(
      paginatedResponse(appointments.map(mapAppointmentToListItem), totalCount, page, pageSize),
    );
  } catch (err) {
    console.error("Appointment list error:", err);
    return serverError();
  }
}

// POST /api/appointment - Create appointment
export async function POST(req: NextRequest) {
  const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
  if (error) return error;

  try {
    const body = await req.json();
    const {
      customerId,
      staffId,
      treatmentId,
      startTime,
      endTime,
      notes,
      isRecurring,
      recurrenceIntervalDays,
      totalSessions,
    } = body;

    if (!customerId || !staffId || !treatmentId || !startTime) {
      return fail("customerId, staffId, treatmentId ve startTime zorunludur.");
    }

    const start = new Date(startTime);
    if (Number.isNaN(start.getTime())) {
      return fail("Geçersiz başlangıç zamanı.");
    }

    const [customer, staff, treatment] = await Promise.all([
      prisma.customers.findFirst({
        where: { Id: customerId, TenantId: user!.tenantId, IsActive: true },
        select: { Id: true },
      }),
      prisma.users.findFirst({
        where: { Id: staffId, TenantId: user!.tenantId, IsActive: true },
        select: { Id: true },
      }),
      prisma.treatments.findFirst({
        where: { Id: treatmentId, TenantId: user!.tenantId, IsActive: true },
        select: { Id: true, DurationMinutes: true },
      }),
    ]);

    if (!customer) {
      return fail("Müşteri bulunamadı.", "NOT_FOUND", 404);
    }

    if (!staff) {
      return fail("Personel bulunamadı.", "NOT_FOUND", 404);
    }

    if (!treatment) {
      return fail("Hizmet bulunamadı.", "NOT_FOUND", 404);
    }

    const resolvedEnd = endTime
      ? new Date(endTime)
      : new Date(start.getTime() + treatment.DurationMinutes * 60 * 1000);

    if (Number.isNaN(resolvedEnd.getTime())) {
      return fail("Geçersiz bitiş zamanı.");
    }

    if (resolvedEnd <= start) {
      return fail("Bitiş zamanı başlangıç zamanından sonra olmalıdır.");
    }

    const conflicts = await getAppointmentAvailabilityConflicts({
      tenantId: user!.tenantId,
      staffId,
      start,
      end: resolvedEnd,
    });

    if (conflicts.length > 0) {
      const availabilityError = getAppointmentAvailabilityError(conflicts);
      return fail(availabilityError.message, availabilityError.code);
    }

    const tenant = await prisma.tenants.findUnique({
      where: { Id: user!.tenantId },
      select: { AutoConfirmAppointments: true },
    });

    const initialStatus = tenant?.AutoConfirmAppointments ? 2 : 1;
    const now = new Date();

    const appointment = await prisma.appointments.create({
      data: {
        TenantId: user!.tenantId,
        CustomerId: customerId,
        StaffId: staffId,
        TreatmentId: treatmentId,
        StartTime: start,
        EndTime: resolvedEnd,
        Status: initialStatus,
        Notes: notes || null,
        IsRecurring: isRecurring || false,
        RecurrenceIntervalDays: isRecurring ? recurrenceIntervalDays : null,
        TotalSessions: isRecurring ? totalSessions : null,
        SessionNumber: 1,
        ParentAppointmentId: null,
        CUser: user!.id,
        CDate: now,
        UUser: user!.id,
        UDate: now,
        IsActive: true,
      },
    });

    if (isRecurring && recurrenceIntervalDays && totalSessions && totalSessions > 1) {
      const childAppointments = [];

      for (let i = 1; i < totalSessions; i++) {
        const childStart = new Date(start);
        childStart.setDate(childStart.getDate() + recurrenceIntervalDays * i);
        const childEnd = new Date(resolvedEnd);
        childEnd.setDate(childEnd.getDate() + recurrenceIntervalDays * i);

        childAppointments.push({
          TenantId: user!.tenantId,
          CustomerId: customerId,
          StaffId: staffId,
          TreatmentId: treatmentId,
          StartTime: childStart,
          EndTime: childEnd,
          Status: initialStatus,
          Notes: notes || null,
          IsRecurring: true,
          RecurrenceIntervalDays: recurrenceIntervalDays,
          TotalSessions: totalSessions,
          SessionNumber: i + 1,
          ParentAppointmentId: appointment.Id,
          CUser: user!.id,
          CDate: now,
          UUser: user!.id,
          UDate: now,
          IsActive: true,
        });
      }

      if (childAppointments.length > 0) {
        await prisma.appointments.createMany({ data: childAppointments });
      }
    }

    return success(appointment, "Randevu başarıyla oluşturuldu.");
  } catch (err) {
    console.error("Appointment create error:", err);
    return serverError();
  }
}
