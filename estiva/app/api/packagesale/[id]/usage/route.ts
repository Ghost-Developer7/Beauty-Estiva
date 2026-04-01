import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError, notFound } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

export async function POST(
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
    });
    if (!pkg) return notFound("Paket satışı bulunamadı");

    if (pkg.UsedSessions >= pkg.TotalSessions) {
      return fail("Tüm seanslar kullanılmış");
    }

    const body = await req.json();
    const { staffId, notes } = body;
    const now = new Date();

    const usage = await prisma.packageSales_Usages.create({
      data: {
        PackageSaleId: packageId,
        TenantId: user!.tenantId,
        UsageDate: now,
        StaffId: staffId || null,
        Notes: notes || null,
        CUser: user!.id,
        CDate: now,
        IsActive: true,
      },
    });

    const newUsedSessions = pkg.UsedSessions + 1;
    const updateData: any = {
      UsedSessions: newUsedSessions,
      UUser: user!.id,
      UDate: now,
    };

    // If all sessions used, mark as completed
    if (newUsedSessions >= pkg.TotalSessions) {
      updateData.Status = 2; // Completed
    }

    await prisma.packageSales_Packages.update({
      where: { Id: packageId },
      data: updateData,
    });

    return success(
      { usage, usedSessions: newUsedSessions, totalSessions: pkg.TotalSessions },
      "Seans kullanımı kaydedildi"
    );
  } catch (error) {
    console.error("Package usage POST error:", error);
    return serverError();
  }
}
