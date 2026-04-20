import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { getAppointmentAvailabilityConflicts } from "@/lib/appointment-availability";

// POST /api/appointment/check-availability - Check staff availability
export async function POST(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { staffId, startTime, endTime } = body;

    if (!staffId || !startTime || !endTime) {
      return fail("staffId, startTime ve endTime zorunludur.");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return fail("Geçersiz tarih aralığı.");
    }

    const staff = await prisma.users.findFirst({
      where: {
        TenantId: user!.tenantId,
        Id: staffId,
        IsActive: true,
      },
      select: { Id: true },
    });

    if (!staff) {
      return fail("Personel bulunamadı.", "NOT_FOUND", 404);
    }

    const conflicts = await getAppointmentAvailabilityConflicts({
      tenantId: user!.tenantId,
      staffId,
      start,
      end,
    });

    return success({
      available: conflicts.length === 0,
      conflicts,
    });
  } catch (err) {
    console.error("Check availability error:", err);
    return serverError();
  }
}
