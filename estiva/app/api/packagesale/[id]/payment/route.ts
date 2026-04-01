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

    const body = await req.json();
    const { amount, paymentMethod, notes } = body;

    if (!amount || amount <= 0) {
      return fail("Geçerli bir tutar giriniz");
    }

    const now = new Date();

    const payment = await prisma.packageSales_Payments.create({
      data: {
        PackageSaleId: packageId,
        TenantId: user!.tenantId,
        Amount: amount,
        PaymentMethod: paymentMethod || 0,
        PaidAt: now,
        Notes: notes || null,
        CUser: user!.id,
        CDate: now,
        IsActive: true,
      },
    });

    // Update PaidAmount on parent
    const newPaidAmount = Number(pkg.PaidAmount) + amount;
    await prisma.packageSales_Packages.update({
      where: { Id: packageId },
      data: {
        PaidAmount: newPaidAmount,
        UUser: user!.id,
        UDate: now,
      },
    });

    return success(
      { payment, totalPaid: newPaidAmount, totalPrice: pkg.TotalPrice },
      "Ödeme kaydedildi"
    );
  } catch (error) {
    console.error("Package payment POST error:", error);
    return serverError();
  }
}
