import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/appointment/[id] — Get appointment detail
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz randevu ID.");

    const appointment = await prisma.appointments.findFirst({
      where: {
        Id: id,
        TenantId: user!.tenantId,
        IsActive: true,
      },
      include: {
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
          select: { Id: true, StartTime: true, EndTime: true, Status: true, SessionNumber: true },
          orderBy: { SessionNumber: "asc" },
        },
        AppointmentPayments: {
          where: { IsActive: true },
          select: { Id: true, Amount: true, AmountInTry: true, PaymentMethod: true, PaidAt: true },
        },
      },
    });

    if (!appointment) return notFound("Randevu bulunamadı.");

    return success(appointment);
  } catch (err) {
    console.error("Appointment detail error:", err);
    return serverError();
  }
}

// PUT /api/appointment/[id] — Update appointment
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz randevu ID.");

    const existing = await prisma.appointments.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Randevu bulunamadı.");

    const body = await req.json();
    const { customerId, staffId, treatmentId, startTime, endTime, notes, status } = body;

    const start = startTime ? new Date(startTime) : existing.StartTime;
    const end = endTime ? new Date(endTime) : existing.EndTime;
    const targetStaffId = staffId || existing.StaffId;

    // Check overlap if time or staff changed
    if (startTime || endTime || staffId) {
      const overlap = await prisma.appointments.findFirst({
        where: {
          TenantId: user!.tenantId,
          StaffId: targetStaffId,
          IsActive: true,
          Status: { not: 4 },
          Id: { not: id },
          OR: [
            { StartTime: { lt: end }, EndTime: { gt: start } },
          ],
        },
      });

      if (overlap) {
        return fail("Bu personelin seçilen zaman aralığında başka bir randevusu bulunmaktadır.", "OVERLAP");
      }
    }

    const updated = await prisma.appointments.update({
      where: { Id: id },
      data: {
        CustomerId: customerId ?? existing.CustomerId,
        StaffId: targetStaffId,
        TreatmentId: treatmentId ?? existing.TreatmentId,
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

// DELETE /api/appointment/[id] — Soft delete appointment
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz randevu ID.");

    const existing = await prisma.appointments.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!existing) return notFound("Randevu bulunamadı.");

    await prisma.appointments.update({
      where: { Id: id },
      data: {
        IsActive: false,
        Status: 4, // Cancelled
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
