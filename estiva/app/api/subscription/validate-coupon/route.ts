import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";

// POST /api/subscription/validate-coupon — Validate coupon code (no auth)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) return fail("Kupon kodu gereklidir");

    const coupon = await prisma.coupons.findFirst({
      where: {
        Code: code,
        IsActive: true,
        StartDate: { lte: new Date() },
        EndDate: { gte: new Date() },
      },
    });

    if (!coupon) return fail("Geçersiz veya süresi dolmuş kupon kodu");

    if (coupon.MaxUsageCount && coupon.CurrentUsageCount >= coupon.MaxUsageCount) {
      return fail("Bu kupon kullanım limitine ulaşmış");
    }

    return success({
      id: coupon.Id,
      code: coupon.Code,
      description: coupon.Description,
      isPercentage: coupon.IsPercentage,
      discountAmount: coupon.DiscountAmount,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return serverError();
  }
}
