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

    const [staffMembers, totalCount] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          Id: true,
          Name: true,
          Surname: true,
          Email: true,
          PhoneNumber: true,
          IsApproved: true,
          ProfilePicturePath: true,
          DefaultCommissionRate: true,
          BranchId: true,
          CDate: true,
          UserRoles: {
            select: {
              Roles: {
                select: {
                  Id: true,
                  Name: true,
                },
              },
            },
          },
          Branches: {
            select: {
              Id: true,
              Name: true,
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
      isApproved: s.IsApproved,
      profilePicture: s.ProfilePicturePath,
      defaultCommissionRate: s.DefaultCommissionRate,
      branch: s.Branches ? { id: s.Branches.Id, name: s.Branches.Name } : null,
      roles: s.UserRoles.map((ur) => ({
        id: ur.Roles.Id,
        name: ur.Roles.Name,
      })),
      joinedDate: s.CDate,
    }));

    return success(paginatedResponse(items, totalCount, page, pageSize));
  } catch (error) {
    console.error("List staff error:", error);
    return serverError();
  }
}
