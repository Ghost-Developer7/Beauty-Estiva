import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError, notFound } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { id } = await params;
    const unavailId = parseInt(id);
    if (isNaN(unavailId)) return fail("Geçersiz ID");

    const unavailability = await prisma.staffUnavailabilities.findFirst({
      where: { Id: unavailId, TenantId: user!.tenantId, IsActive: true },
      include: {
        Users: { select: { Id: true, Name: true, Surname: true } },
      },
    });

    if (!unavailability) return notFound("Kayıt bulunamadı");

    return success({
      id: unavailability.Id,
      staffId: unavailability.StaffId,
      staffName: `${unavailability.Users.Name} ${unavailability.Users.Surname}`,
      startTime: unavailability.StartTime,
      endTime: unavailability.EndTime,
      reason: unavailability.Reason,
      notes: unavailability.Notes,
    });
  } catch (error) {
    console.error("Unavailability GET by ID error:", error);
    return serverError();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { id } = await params;
    const unavailId = parseInt(id);
    if (isNaN(unavailId)) return fail("Geçersiz ID");

    const existing = await prisma.staffUnavailabilities.findFirst({
      where: { Id: unavailId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!existing) return notFound("Kayıt bulunamadı");

    const body = await req.json();
    const data: any = { UUser: user!.id, UDate: new Date() };

    if (body.startTime) data.StartTime = new Date(body.startTime);
    if (body.endTime) data.EndTime = new Date(body.endTime);
    if (body.reason !== undefined) data.Reason = body.reason;
    if (body.notes !== undefined) data.Notes = body.notes;

    const updated = await prisma.staffUnavailabilities.update({
      where: { Id: unavailId },
      data,
    });

    return success(updated, "Kayıt güncellendi");
  } catch (error) {
    console.error("Unavailability PUT error:", error);
    return serverError();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { id } = await params;
    const unavailId = parseInt(id);
    if (isNaN(unavailId)) return fail("Geçersiz ID");

    const existing = await prisma.staffUnavailabilities.findFirst({
      where: { Id: unavailId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!existing) return notFound("Kayıt bulunamadı");

    await prisma.staffUnavailabilities.update({
      where: { Id: unavailId },
      data: { IsActive: false, UUser: user!.id, UDate: new Date() },
    });

    return success(null, "Kayıt silindi");
  } catch (error) {
    console.error("Unavailability DELETE error:", error);
    return serverError();
  }
}
