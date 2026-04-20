import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
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

const appointmentDetailInclude = {
  Customers: {
    select: { Id: true, Name: true, Surname: true, Phone: true, Email: true },
  },
  Users: {
    select: { Id: true, Name: true, Surname: true },
  },
  Treatments: {
    select: { Id: true, Name: true, DurationMinutes: true, Price: true, Color: true },
  },
  other_Appointments: {
    where: { IsActive: true },
    select: {
      Id: true,
      StartTime: true,
      EndTime: true,
      Status: true,
      SessionNumber: true,
      TotalSessions: true,
      ParentAppointmentId: true,
      CustomerId: true,
      StaffId: true,
      TreatmentId: true,
      Notes: true,
      IsRecurring: true,
    },
    orderBy: { SessionNumber: "asc" },
  },
  AppointmentPayments: {
    where: { IsActive: true },
    select: { Id: true, Amount: true, AmountInTry: true, PaymentMethod: true, PaidAt: true },
  },
} satisfies Prisma.AppointmentsInclude;

type AppointmentDetailRecord = Prisma.AppointmentsGetPayload<{
  include: typeof appointmentDetailInclude;
}>;

type AppointmentSeriesRecord = AppointmentDetailRecord["other_Appointments"][number];

// GET /api/appointment/[id] - Get appointment detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id)) return fail("Geçersiz randevu ID.");

    const appointment = await prisma.appointments.findFirst({
      where: {
        Id: id,
        TenantId: user!.tenantId,
        IsActive: true,
      },
      include: appointmentDetailInclude,
    });

    if (!appointment) return notFound("Randevu bulunamadı.");

    return success({
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
      recurrenceIntervalDays: appointment.RecurrenceIntervalDays || null,
      seriesAppointments: appointment.other_Appointments.map(
        (seriesAppointment: AppointmentSeriesRecord) => ({
          id: seriesAppointment.Id,
          customerId: seriesAppointment.CustomerId,
          customerFullName: appointment.Customers
            ? `${appointment.Customers.Name} ${appointment.Customers.Surname}`
            : "",
          customerPhone: appointment.Customers?.Phone || "",
          staffId: seriesAppointment.StaffId,
          staffFullName: appointment.Users
            ? `${appointment.Users.Name} ${appointment.Users.Surname}`
            : "",
          treatmentId: seriesAppointment.TreatmentId,
          treatmentName: appointment.Treatments?.Name || "",
          treatmentColor: appointment.Treatments?.Color || null,
          durationMinutes: appointment.Treatments?.DurationMinutes || 0,
          startTime: seriesAppointment.StartTime,
          endTime: seriesAppointment.EndTime,
          status: APPOINTMENT_STATUS_MAP[seriesAppointment.Status] || "Scheduled",
          notes: seriesAppointment.Notes,
          isRecurring: seriesAppointment.IsRecurring || false,
          sessionNumber: seriesAppointment.SessionNumber || 1,
          totalSessions: seriesAppointment.TotalSessions || null,
          parentAppointmentId: seriesAppointment.ParentAppointmentId || null,
        }),
      ),
    });
  } catch (err) {
    console.error("Appointment detail error:", err);
    return serverError();
  }
}

// PUT /api/appointment/[id] - Update appointment
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id)) return fail("Geçersiz randevu ID.");

    const existing = await prisma.appointments.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Randevu bulunamadı.");

    const body = await req.json();
    const { customerId, staffId, treatmentId, startTime, endTime, notes, status } = body;

    const targetCustomerId = customerId ?? existing.CustomerId;
    const targetStaffId = staffId ?? existing.StaffId;
    const targetTreatmentId = treatmentId ?? existing.TreatmentId;
    const start = startTime ? new Date(startTime) : existing.StartTime;
    const end = endTime ? new Date(endTime) : existing.EndTime;

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return fail("Geçersiz tarih aralığı.");
    }

    if (end <= start) {
      return fail("Bitiş zamanı başlangıç zamanından sonra olmalıdır.");
    }

    const [customer, staff, treatment] = await Promise.all([
      prisma.customers.findFirst({
        where: { Id: targetCustomerId, TenantId: user!.tenantId, IsActive: true },
        select: { Id: true },
      }),
      prisma.users.findFirst({
        where: { Id: targetStaffId, TenantId: user!.tenantId, IsActive: true },
        select: { Id: true },
      }),
      prisma.treatments.findFirst({
        where: { Id: targetTreatmentId, TenantId: user!.tenantId, IsActive: true },
        select: { Id: true },
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

    if (startTime || endTime || staffId) {
      const conflicts = await getAppointmentAvailabilityConflicts({
        tenantId: user!.tenantId,
        staffId: targetStaffId,
        start,
        end,
        ignoreAppointmentId: id,
      });

      if (conflicts.length > 0) {
        const availabilityError = getAppointmentAvailabilityError(conflicts);
        return fail(availabilityError.message, availabilityError.code);
      }
    }

    const updated = await prisma.appointments.update({
      where: { Id: id },
      data: {
        CustomerId: targetCustomerId,
        StaffId: targetStaffId,
        TreatmentId: targetTreatmentId,
        StartTime: start,
        EndTime: end,
        Notes: notes !== undefined ? notes : existing.Notes,
        Status: status ?? existing.Status,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(updated, "Randevu başarıyla güncellendi.");
  } catch (err) {
    console.error("Appointment update error:", err);
    return serverError();
  }
}

// DELETE /api/appointment/[id] - Soft delete appointment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id)) return fail("Geçersiz randevu ID.");

    const existing = await prisma.appointments.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Randevu bulunamadı.");

    await prisma.appointments.update({
      where: { Id: id },
      data: {
        IsActive: false,
        Status: 4,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(null, "Randevu başarıyla iptal edildi.");
  } catch (err) {
    console.error("Appointment delete error:", err);
    return serverError();
  }
}
