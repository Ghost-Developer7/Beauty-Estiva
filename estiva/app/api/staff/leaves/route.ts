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
    const status = searchParams.get("status");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = {
      TenantId: user!.tenantId,
      IsActive: true,
    };

    if (staffId) where.StaffId = parseInt(staffId);
    if (status) where.Status = status;

    if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.StartDate = { lte: endOfMonth };
      where.EndDate = { gte: startOfMonth };
    } else if (year) {
      const startOfYear = new Date(parseInt(year), 0, 1);
      const endOfYear = new Date(parseInt(year), 11, 31, 23, 59, 59);
      where.StartDate = { lte: endOfYear };
      where.EndDate = { gte: startOfYear };
    }

    const [leaves, totalCount] = await Promise.all([
      prisma.staffLeaves.findMany({
        where,
        include: {
          Users_StaffLeaves_StaffIdToUsers: {
            select: { Id: true, Name: true, Surname: true },
          },
          Users_StaffLeaves_ApprovedByIdToUsers: {
            select: { Id: true, Name: true, Surname: true },
          },
        },
        orderBy: { StartDate: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.staffLeaves.count({ where }),
    ]);

    const items = leaves.map((l) => ({
      id: l.Id,
      staffId: l.StaffId,
      staffName: `${l.Users_StaffLeaves_StaffIdToUsers.Name} ${l.Users_StaffLeaves_StaffIdToUsers.Surname}`,
      startDate: l.StartDate,
      endDate: l.EndDate,
      leaveType: l.LeaveType,
      reason: l.Reason,
      status: l.Status,
      approvedById: l.ApprovedById,
      approvedByName: l.Users_StaffLeaves_ApprovedByIdToUsers
        ? `${l.Users_StaffLeaves_ApprovedByIdToUsers.Name} ${l.Users_StaffLeaves_ApprovedByIdToUsers.Surname}`
        : null,
      approvedDate: l.ApprovedDate,
      cDate: l.CDate,
    }));

    return success(paginatedResponse(items, totalCount, page, pageSize));
  } catch (error) {
    console.error("Staff leaves GET error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const body = await req.json();
    const { staffId, startDate, endDate, leaveType, reason } = body;

    if (!staffId || !startDate || !endDate || !leaveType) {
      return fail("staffId, startDate, endDate ve leaveType alanları zorunludur");
    }

    // Verify staff belongs to tenant
    const staff = await prisma.users.findFirst({
      where: { Id: staffId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!staff) return fail("Personel bulunamadı");

    const leave = await prisma.staffLeaves.create({
      data: {
        TenantId: user!.tenantId,
        StaffId: staffId,
        StartDate: new Date(startDate),
        EndDate: new Date(endDate),
        LeaveType: leaveType,
        Reason: reason || null,
        Status: "Pending",
        CUser: user!.id,
        CDate: new Date(),
        IsActive: true,
      },
    });

    return success(leave, "İzin talebi oluşturuldu");
  } catch (error) {
    console.error("Staff leaves POST error:", error);
    return serverError();
  }
}
