import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { getPaginationParams, paginatedResponse } from "@/lib/pagination";

// GET /api/commission/records — Commission records with filters
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const { page, pageSize, skip } = getPaginationParams(searchParams);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const staffId = searchParams.get("staffId");
    const isPaid = searchParams.get("isPaid");

    const where: any = {
      TenantId: user!.tenantId,
      IsActive: true,
    };

    if (staffId) where.StaffId = parseInt(staffId);
    if (isPaid !== null && isPaid !== undefined && isPaid !== "") {
      where.IsPaid = isPaid === "true";
    }
    if (startDate || endDate) {
      where.CDate = {};
      if (startDate) where.CDate.gte = new Date(startDate);
      if (endDate) where.CDate.lte = new Date(endDate);
    }

    const [records, totalCount] = await Promise.all([
      prisma.staffCommissionRecords.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { CDate: "desc" },
        include: {
          Users: { select: { Id: true, Name: true, Surname: true } },
          AppointmentPayments: {
            select: {
              Id: true,
              Amount: true,
              AmountInTry: true,
              PaidAt: true,
              Appointments: {
                select: {
                  Customers: { select: { Name: true, Surname: true } },
                  Treatments: { select: { Name: true } },
                },
              },
            },
          },
        },
      }),
      prisma.staffCommissionRecords.count({ where }),
    ]);

    return success(paginatedResponse(records, totalCount, page, pageSize));
  } catch (err) {
    console.error("Commission records GET error:", err);
    return serverError();
  }
}
