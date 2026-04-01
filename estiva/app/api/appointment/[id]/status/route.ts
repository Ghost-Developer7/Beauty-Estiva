import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// PATCH /api/appointment/[id]/status — Update appointment status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
  if (error) return error;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) return fail("Geçersiz randevu ID.");

    const body = await req.json();
    const { status } = body;

    // Validate status: 1=Scheduled, 2=Confirmed, 3=Completed, 4=Cancelled, 5=NoShow
    if (!status || ![1, 2, 3, 4, 5].includes(status)) {
      return fail("Geçersiz durum. Geçerli değerler: 1=Planlandı, 2=Onaylandı, 3=Tamamlandı, 4=İptal, 5=Gelmedi");
    }

    const appointment = await prisma.appointments.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!appointment) return notFound("Randevu bulunamadı.");

    const now = new Date();

    // Update appointment status
    const updated = await prisma.appointments.update({
      where: { Id: id },
      data: {
        Status: status,
        UUser: user!.id,
        UDate: now,
      },
    });

    // When completed (3): update customer TotalVisits +1, LastVisitDate
    if (status === 3) {
      await prisma.customers.update({
        where: { Id: appointment.CustomerId },
        data: {
          TotalVisits: { increment: 1 },
          LastVisitDate: now,
          UUser: user!.id,
          UDate: now,
        },
      });
    }

    return success(updated, "Randevu durumu güncellendi.");
  } catch (err) {
    console.error("Appointment status update error:", err);
    return serverError();
  }
}
