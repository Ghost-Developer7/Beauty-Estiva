import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

// DELETE /api/packagesale/usage/[usageId] — Delete a usage record
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ usageId: string }> }
) {
  try {
    const { user, error } = await requireSubscription(req);
    if (error) return error;

    const { usageId } = await params;
    const id = parseInt(usageId);
    if (isNaN(id)) return fail("Geçersiz kullanım ID");

    const usage = await prisma.packageSales_Usages.findFirst({
      where: { Id: id, TenantId: user!.tenantId, IsActive: true },
    });

    if (!usage) return notFound("Kullanım kaydı bulunamadı");

    // Soft delete usage
    await prisma.packageSales_Usages.update({
      where: { Id: id },
      data: { IsActive: false, UUser: user!.id, UDate: new Date() },
    });

    // Decrement used sessions on the package
    await prisma.packageSales_Packages.update({
      where: { Id: usage.PackageSaleId },
      data: {
        UsedSessions: { decrement: 1 },
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(null, "Kullanım kaydı silindi");
  } catch (error) {
    console.error("Package usage DELETE error:", error);
    return serverError();
  }
}
