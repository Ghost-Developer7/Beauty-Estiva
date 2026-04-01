import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";
import { getPaginationParams, paginatedResponse } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner", "Admin"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const where = {
      TenantId: user!.tenantId,
    };

    const [logs, totalCount] = await Promise.all([
      prisma.roleChangeAuditLogs.findMany({
        where,
        orderBy: { CreatedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.roleChangeAuditLogs.count({ where }),
    ]);

    const items = logs.map((l) => ({
      id: l.Id,
      targetUserId: l.TargetUserId,
      targetUserName: l.TargetUserName,
      performedByUserId: l.PerformedByUserId,
      performedByUserName: l.PerformedByUserName,
      actionType: l.ActionType,
      oldRole: l.OldRole,
      newRole: l.NewRole,
      reason: l.Reason,
      tenantName: l.TenantName,
      createdAt: l.CreatedAt,
    }));

    return success(paginatedResponse(items, totalCount, page, pageSize));
  } catch (error) {
    console.error("Audit log GET error:", error);
    return serverError();
  }
}
