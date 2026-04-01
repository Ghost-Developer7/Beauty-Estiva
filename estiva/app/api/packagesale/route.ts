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
    const action = searchParams.get("action");

    // Stats action
    if (action === "stats") {
      const packages = await prisma.packageSales_Packages.findMany({
        where: { TenantId: user!.tenantId, IsActive: true },
      });

      const active = packages.filter((p) => p.Status === 1);
      const completed = packages.filter((p) => p.Status === 2);
      const expired = packages.filter((p) => p.Status === 3);

      return success({
        activeCount: active.length,
        completedCount: completed.length,
        expiredCount: expired.length,
        activeTotalPrice: active.reduce((sum, p) => sum + Number(p.TotalPrice), 0),
        completedTotalPrice: completed.reduce((sum, p) => sum + Number(p.TotalPrice), 0),
        expiredTotalPrice: expired.reduce((sum, p) => sum + Number(p.TotalPrice), 0),
      });
    }

    // List action
    const { page, pageSize, skip } = getPaginationParams(searchParams);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const customerId = searchParams.get("customerId");
    const treatmentId = searchParams.get("treatmentId");
    const status = searchParams.get("status");

    const where: any = { TenantId: user!.tenantId, IsActive: true };

    if (startDate) where.StartDate = { ...(where.StartDate || {}), gte: new Date(startDate) };
    if (endDate) where.EndDate = { ...(where.EndDate || {}), lte: new Date(endDate) };
    if (customerId) where.CustomerId = parseInt(customerId);
    if (treatmentId) where.TreatmentId = parseInt(treatmentId);
    if (status) where.Status = parseInt(status);

    const [items, totalCount] = await Promise.all([
      prisma.packageSales_Packages.findMany({
        where,
        include: {
          Customers: { select: { Name: true, Surname: true } },
          Treatments: { select: { Name: true } },
          Users: { select: { Name: true, Surname: true } },
        },
        orderBy: { CDate: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.packageSales_Packages.count({ where }),
    ]);

    const mapped = items.map((p) => ({
      id: p.Id,
      customerId: p.CustomerId,
      customerName: `${p.Customers.Name} ${p.Customers.Surname}`,
      treatmentId: p.TreatmentId,
      treatmentName: p.Treatments.Name,
      staffId: p.StaffId,
      staffName: `${p.Users.Name} ${p.Users.Surname}`,
      totalSessions: p.TotalSessions,
      usedSessions: p.UsedSessions,
      totalPrice: p.TotalPrice,
      paidAmount: p.PaidAmount,
      paymentMethod: p.PaymentMethod,
      startDate: p.StartDate,
      endDate: p.EndDate,
      status: p.Status,
      notes: p.Notes,
      cDate: p.CDate,
    }));

    return success(paginatedResponse(mapped, totalCount, page, pageSize));
  } catch (error) {
    console.error("Package sales GET error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const body = await req.json();
    const {
      customerId, treatmentId, staffId, totalSessions,
      totalPrice, paidAmount, paymentMethod, startDate, endDate, notes,
    } = body;

    if (!customerId || !treatmentId || !staffId || !totalSessions || !totalPrice || !startDate || !endDate) {
      return fail("Zorunlu alanlar eksik");
    }

    const packageSale = await prisma.packageSales_Packages.create({
      data: {
        TenantId: user!.tenantId,
        CustomerId: customerId,
        TreatmentId: treatmentId,
        StaffId: staffId,
        TotalSessions: totalSessions,
        UsedSessions: 0,
        TotalPrice: totalPrice,
        PaidAmount: paidAmount || 0,
        PaymentMethod: paymentMethod || 0,
        StartDate: new Date(startDate),
        EndDate: new Date(endDate),
        Status: 1, // Active
        Notes: notes || null,
        CUser: user!.id,
        CDate: new Date(),
        IsActive: true,
      },
    });

    // If there's an initial payment, record it
    if (paidAmount && paidAmount > 0) {
      await prisma.packageSales_Payments.create({
        data: {
          PackageSaleId: packageSale.Id,
          TenantId: user!.tenantId,
          Amount: paidAmount,
          PaymentMethod: paymentMethod || 0,
          PaidAt: new Date(),
          Notes: "İlk ödeme",
          CUser: user!.id,
          CDate: new Date(),
          IsActive: true,
        },
      });
    }

    return success(packageSale, "Paket satışı oluşturuldu");
  } catch (error) {
    console.error("Package sales POST error:", error);
    return serverError();
  }
}
