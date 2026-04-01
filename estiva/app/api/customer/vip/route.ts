import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// GET /api/customer/vip — Top customers by TotalSpent
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const customers = await prisma.customers.findMany({
      where: { TenantId: user!.tenantId, IsActive: true },
      select: {
        Id: true,
        Name: true,
        Surname: true,
        Phone: true,
        Email: true,
        TotalSpent: true,
        TotalVisits: true,
        LoyaltyPoints: true,
        CustomerSince: true,
        LastVisitDate: true,
        Tags: true,
      },
      orderBy: { TotalSpent: "desc" },
      take: limit,
    });

    return success(
      customers.map((c) => ({
        id: c.Id,
        name: c.Name,
        surname: c.Surname,
        phone: c.Phone,
        email: c.Email,
        totalSpent: c.TotalSpent,
        totalVisits: c.TotalVisits,
        loyaltyPoints: c.LoyaltyPoints,
        customerSince: c.CustomerSince,
        lastVisitDate: c.LastVisitDate,
        tags: c.Tags,
      }))
    );
  } catch (error) {
    console.error("VIP customers GET error:", error);
    return serverError();
  }
}
