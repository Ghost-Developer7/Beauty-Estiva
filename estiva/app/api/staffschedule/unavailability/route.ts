import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { getPaginationParams, paginatedResponse } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip } = getPaginationParams(searchParams);
    const staffId = searchParams.get("staffId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      TenantId: user!.tenantId,
      IsActive: true,
    };

    if (staffId) where.StaffId = parseInt(staffId);
    if (startDate) where.StartTime = { ...(where.StartTime || {}), gte: new Date(startDate) };
    if (endDate) where.EndTime = { ...(where.EndTime || {}), lte: new Date(endDate) };

    const [items, totalCount] = await Promise.all([
      prisma.staffUnavailabilities.findMany({
        where,
        include: {
          Users: { select: { Id: true, Name: true, Surname: true } },
        },
        orderBy: { StartTime: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.staffUnavailabilities.count({ where }),
    ]);

    const mapped = items.map((u) => ({
      id: u.Id,
      staffId: u.StaffId,
      staffName: `${u.Users.Name} ${u.Users.Surname}`,
      startTime: u.StartTime,
      endTime: u.EndTime,
      reason: u.Reason,
      notes: u.Notes,
    }));

    return success(paginatedResponse(mapped, totalCount, page, pageSize));
  } catch (error) {
    console.error("Unavailability GET error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const body = await req.json();
    const { staffId, startTime, endTime, reason, notes } = body;

    if (!staffId || !startTime || !endTime || !reason) {
      return fail("staffId, startTime, endTime ve reason alanları zorunludur");
    }

    const staff = await prisma.users.findFirst({
      where: { Id: staffId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!staff) return fail("Personel bulunamadı");

    const unavailability = await prisma.staffUnavailabilities.create({
      data: {
        TenantId: user!.tenantId,
        StaffId: staffId,
        StartTime: new Date(startTime),
        EndTime: new Date(endTime),
        Reason: reason,
        Notes: notes || null,
        CUser: user!.id,
        CDate: new Date(),
        IsActive: true,
      },
    });

    return success(unavailability, "Müsait olmama kaydı oluşturuldu");
  } catch (error) {
    console.error("Unavailability POST error:", error);
    return serverError();
  }
}
