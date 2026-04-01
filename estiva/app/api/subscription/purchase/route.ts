import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireRoles } from "@/lib/api-middleware";
import crypto from "crypto";

// POST /api/subscription/purchase — PayTR checkout [Owner]
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireRoles(req, ["Owner"]);
    if (error) return error;

    const body = await req.json();
    const { planId, period, couponCode } = body;

    if (!planId || !period) return fail("planId ve period gereklidir");

    const plan = await prisma.subscriptionPlans.findUnique({
      where: { Id: planId },
    });
    if (!plan || !plan.IsActive) return fail("Plan bulunamadı");

    let totalAmount = period === "yearly" ? Number(plan.YearlyPrice) : Number(plan.MonthlyPrice);
    let couponId: number | null = null;
    let discountAmount = 0;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupons.findFirst({
        where: {
          Code: couponCode,
          IsActive: true,
          StartDate: { lte: new Date() },
          EndDate: { gte: new Date() },
        },
      });

      if (coupon) {
        couponId = coupon.Id;
        discountAmount = coupon.IsPercentage
          ? totalAmount * (Number(coupon.DiscountAmount) / 100)
          : Number(coupon.DiscountAmount);
        totalAmount = Math.max(0, totalAmount - discountAmount);
      }
    }

    // Generate PayTR iframe token
    const merchantId = process.env.PAYTR_MERCHANT_ID || "";
    const merchantKey = process.env.PAYTR_MERCHANT_KEY || "";
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT || "";
    const merchantOid = `SUB-${user!.tenantId}-${Date.now()}`;

    const userIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userBasket = Buffer.from(
      JSON.stringify([[plan.Name, totalAmount.toFixed(2), 1]])
    ).toString("base64");
    const paymentAmount = Math.round(totalAmount * 100);

    const hashStr =
      merchantId +
      userIp +
      merchantOid +
      (user!.email || "") +
      paymentAmount +
      userBasket +
      "0" +
      "0" +
      "TL" +
      "1";

    const paytrToken = crypto
      .createHmac("sha256", merchantKey + merchantSalt)
      .update(hashStr)
      .digest("base64");

    try {
      const params = new URLSearchParams({
        merchant_id: merchantId,
        user_ip: userIp.split(",")[0].trim(),
        merchant_oid: merchantOid,
        email: user!.email || "",
        payment_amount: String(paymentAmount),
        paytr_token: paytrToken,
        user_basket: userBasket,
        no_installment: "0",
        max_installment: "0",
        user_name: `${user!.name} ${user!.surname}`,
        user_address: "N/A",
        user_phone: "N/A",
        merchant_ok_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
        merchant_fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/fail`,
        currency: "TL",
        test_mode: process.env.PAYTR_TEST_MODE || "1",
        debug_on: "0",
      });

      const response = await fetch(
        "https://www.paytr.com/odeme/api/get-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        const now = new Date();
        const endDate = new Date(now);
        if (period === "yearly") {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        await prisma.tenantSubscriptions.create({
          data: {
            TenantId: user!.tenantId,
            SubscriptionPlanId: planId,
            PriceSold: totalAmount,
            StartDate: now,
            EndDate: endDate,
            IsActive: false,
            PaymentStatus: "Pending",
            PaymentTransactionId: merchantOid,
            CouponId: couponId,
            DiscountAmount: discountAmount > 0 ? discountAmount : null,
            CUser: user!.id,
            CDate: now,
          },
        });

        return success({
          iframeToken: result.token,
          merchantOid,
        });
      } else {
        return fail(`PayTR token alınamadı: ${result.reason || "Bilinmeyen hata"}`);
      }
    } catch (paytrError) {
      console.error("PayTR error:", paytrError);
      return fail("Ödeme sistemi ile iletişim kurulamadı");
    }
  } catch (error) {
    console.error("Subscription purchase error:", error);
    return serverError();
  }
}
