import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";
import { paginatedResponse, getPaginationParams } from "@/lib/pagination";

/**
 * GET /api/staff
 * List staff members with pagination and roles.
 * Auth required, Roles: Owner, Admin, Staff.
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin", "Staff"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const where = {
      TenantId: user!.tenantId,
      IsActive: true,
    };

    const pageParam = searchParams.get("page") || searchParams.get("pageNumber");

    const [staffMembers, totalCount] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          Id: true,
          Name: true,
          Surname: true,
          Email: true,
          PhoneNumber: true,
          BirthDate: true,
          IsApproved: true,
          IsActive: true,
          ProfilePicturePath: true,
          DefaultCommissionRate: true,
          BranchId: true,
          CDate: true,
          UserRoles: {
            select: {
              Roles: {
                select: {
                  Name: true,
                },
              },
            },
          },
        },
        orderBy: { Name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.users.count({ where }),
    ]);

    const items = staffMembers.map((s) => ({
      id: s.Id,
      name: s.Name,
      surname: s.Surname,
      email: s.Email,
      phone: s.PhoneNumber,
      birthDate: s.BirthDate,
      roles: s.UserRoles.map((ur) => ur.Roles.Name),
      isActive: s.IsActive,
      isApproved: s.IsApproved,
      defaultCommissionRate: Number(s.DefaultCommissionRate) || 0,
      cDate: s.CDate,
    }));

    // If no page param, return flat array for list() calls
    if (!pageParam) {
      return success(items);
    }

    return success(paginatedResponse(items, totalCount, page, pageSize));
  } catch (error) {
    console.error("List staff error:", error);
    return serverError();
  }
}
