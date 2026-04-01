import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { getPaginationParams, paginatedResponse } from "@/lib/pagination";

// GET /api/customer/[id]/history — Past appointments for customer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) return fail("Geçersiz müşteri ID.", "VALIDATION_ERROR");

    const customer = await prisma.customers.findFirst({
      where: { Id: customerId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!customer) return notFound("Müşteri bulunamadı.");

    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const where = {
      CustomerId: customerId,
      TenantId: user!.tenantId,
      IsActive: true,
    };

    const [appointments, totalCount] = await Promise.all([
      prisma.appointments.findMany({
        where,
        select: {
          Id: true,
          StartTime: true,
          EndTime: true,
          Status: true,
          Notes: true,
          Treatments: { select: { Id: true, Name: true } },
          Users: { select: { Id: true, Name: true, Surname: true } },
        },
        orderBy: { StartTime: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.appointments.count({ where }),
    ]);

    const items = appointments.map((a) => ({
      id: a.Id,
      startTime: a.StartTime,
      endTime: a.EndTime,
      status: a.Status,
      notes: a.Notes,
      treatment: a.Treatments ? { id: a.Treatments.Id, name: a.Treatments.Name } : null,
      staff: a.Users ? { id: a.Users.Id, name: a.Users.Name, surname: a.Users.Surname } : null,
    }));

    return success(paginatedResponse(items, totalCount, page, pageSize));
  } catch (error) {
    console.error("Customer history GET error:", error);
    return serverError();
  }
}
