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
    const packageId = parseInt(id);
    if (isNaN(packageId)) return fail("Geçersiz paket ID");

    const pkg = await prisma.packageSales_Packages.findFirst({
      where: { Id: packageId, TenantId: user!.tenantId, IsActive: true },
      include: {
        Customers: { select: { Name: true, Surname: true } },
        Treatments: { select: { Name: true } },
        Users: { select: { Name: true, Surname: true } },
        PackageSales_Usages: {
          where: { IsActive: true },
          include: {
            Users: { select: { Name: true, Surname: true } },
          },
          orderBy: { UsageDate: "desc" },
        },
        PackageSales_Payments: {
          where: { IsActive: true },
          orderBy: { PaidAt: "desc" },
        },
      },
    });

    if (!pkg) return notFound("Paket satışı bulunamadı");

    return success({
      id: pkg.Id,
      customerId: pkg.CustomerId,
      customerName: `${pkg.Customers.Name} ${pkg.Customers.Surname}`,
      treatmentId: pkg.TreatmentId,
      treatmentName: pkg.Treatments.Name,
      staffId: pkg.StaffId,
      staffName: `${pkg.Users.Name} ${pkg.Users.Surname}`,
      totalSessions: pkg.TotalSessions,
      usedSessions: pkg.UsedSessions,
      totalPrice: pkg.TotalPrice,
      paidAmount: pkg.PaidAmount,
      paymentMethod: pkg.PaymentMethod,
      startDate: pkg.StartDate,
      endDate: pkg.EndDate,
      status: pkg.Status,
      notes: pkg.Notes,
      usages: pkg.PackageSales_Usages.map((u) => ({
        id: u.Id,
        usageDate: u.UsageDate,
        staffId: u.StaffId,
        staffName: u.Users ? `${u.Users.Name} ${u.Users.Surname}` : null,
        notes: u.Notes,
      })),
      payments: pkg.PackageSales_Payments.map((p) => ({
        id: p.Id,
        amount: p.Amount,
        paymentMethod: p.PaymentMethod,
        paidAt: p.PaidAt,
        notes: p.Notes,
      })),
    });
  } catch (error) {
    console.error("Package sale GET by ID error:", error);
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
    const packageId = parseInt(id);
    if (isNaN(packageId)) return fail("Geçersiz paket ID");

    const existing = await prisma.packageSales_Packages.findFirst({
      where: { Id: packageId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!existing) return notFound("Paket satışı bulunamadı");

    const body = await req.json();
    const data: any = { UUser: user!.id, UDate: new Date() };

    if (body.totalSessions !== undefined) data.TotalSessions = body.totalSessions;
    if (body.totalPrice !== undefined) data.TotalPrice = body.totalPrice;
    if (body.startDate) data.StartDate = new Date(body.startDate);
    if (body.endDate) data.EndDate = new Date(body.endDate);
    if (body.status !== undefined) data.Status = body.status;
    if (body.notes !== undefined) data.Notes = body.notes;
    if (body.staffId !== undefined) data.StaffId = body.staffId;

    const updated = await prisma.packageSales_Packages.update({
      where: { Id: packageId },
      data,
    });

    return success(updated, "Paket satışı güncellendi");
  } catch (error) {
    console.error("Package sale PUT error:", error);
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
    const packageId = parseInt(id);
    if (isNaN(packageId)) return fail("Geçersiz paket ID");

    const existing = await prisma.packageSales_Packages.findFirst({
      where: { Id: packageId, TenantId: user!.tenantId, IsActive: true },
    });
    if (!existing) return notFound("Paket satışı bulunamadı");

    await prisma.packageSales_Packages.update({
      where: { Id: packageId },
      data: { IsActive: false, UUser: user!.id, UDate: new Date() },
    });

    return success(null, "Paket satışı silindi");
  } catch (error) {
    console.error("Package sale DELETE error:", error);
    return serverError();
  }
}
