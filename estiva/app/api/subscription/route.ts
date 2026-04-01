import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { getAuthUser, requireRoles } from "@/lib/api-middleware";
import { getPaginationParams, paginatedResponse } from "@/lib/pagination";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    // Public endpoint - no auth required
    if (action === "plans") {
      const plans = await prisma.subscriptionPlans.findMany({
        where: { IsActive: true },
        orderBy: { MonthlyPrice: "asc" },
      });

      return success(
        plans.map((p) => ({
          id: p.Id,
          name: p.Name,
          description: p.Description,
          monthlyPrice: p.MonthlyPrice,
          yearlyPrice: p.YearlyPrice,
          maxStaffCount: p.MaxStaffCount,
          maxBranchCount: p.MaxBranchCount,
          hasSmsIntegration: p.HasSmsIntegration,
          hasAiFeatures: p.HasAiFeatures,
          hasSocialMediaIntegration: p.HasSocialMediaIntegration,
          hasWhatsappIntegration: p.HasWhatsappIntegration,
          features: p.Features,
          validityMonths: p.ValidityMonths,
        }))
      );
    }

    // Authenticated endpoints
    const { user, error } = await requireRoles(req, ["Owner"]);
    if (error) return error;

    if (action === "current") {
      const subscription = await prisma.tenantSubscriptions.findFirst({
        where: { TenantId: user!.tenantId, IsActive: true },
        include: { SubscriptionPlans: true },
        orderBy: { StartDate: "desc" },
      });

      if (!subscription) return success(null);

      return success({
        id: subscription.Id,
        planName: subscription.SubscriptionPlans.Name,
        planId: subscription.SubscriptionPlanId,
        priceSold: subscription.PriceSold,
        startDate: subscription.StartDate,
        endDate: subscription.EndDate,
        isTrialPeriod: subscription.IsTrialPeriod,
        trialEndDate: subscription.TrialEndDate,
        isCancelled: subscription.IsCancelled,
        autoRenew: subscription.AutoRenew,
        paymentStatus: subscription.PaymentStatus,
      });
    }

    if (action === "status") {
      const subscription = await prisma.tenantSubscriptions.findFirst({
        where: { TenantId: user!.tenantId, IsActive: true },
        orderBy: { StartDate: "desc" },
      });

      const now = new Date();
      let isActive = false;
      let isTrialPeriod = false;

      if (subscription) {
        if (subscription.IsTrialPeriod && subscription.TrialEndDate) {
          isTrialPeriod = new Date(subscription.TrialEndDate) >= now;
          isActive = isTrialPeriod;
        } else {
          isActive = new Date(subscription.EndDate) >= now && !subscription.IsCancelled;
        }
      }

      return success({ isActive, isTrialPeriod });
    }

    if (action === "payment-history") {
      const { page, pageSize, skip } = getPaginationParams(searchParams);

      const where = { TenantId: user!.tenantId, IsActive: true };
      const [items, totalCount] = await Promise.all([
        prisma.tenantPaymentHistories.findMany({
          where,
          orderBy: { PaymentDate: "desc" },
          skip,
          take: pageSize,
        }),
        prisma.tenantPaymentHistories.count({ where }),
      ]);

      const mapped = items.map((p) => ({
        id: p.Id,
        amount: p.Amount,
        paymentDate: p.PaymentDate,
        transactionId: p.TransactionId,
        paymentStatus: p.PaymentStatus,
        description: p.Description,
        paymentMethod: p.PaymentMethod,
        isRefunded: p.IsRefunded,
        refundAmount: p.RefundAmount,
        refundDate: p.RefundDate,
      }));

      return success(paginatedResponse(mapped, totalCount, page, pageSize));
    }

    if (action === "staff-limit") {
      const tenant = await prisma.tenants.findUnique({
        where: { Id: user!.tenantId },
        include: { SubscriptionPlans: true },
      });

      const currentCount = await prisma.users.count({
        where: { TenantId: user!.tenantId, IsActive: true },
      });

      const maxCount = tenant?.SubscriptionPlans?.MaxStaffCount || 0;

      return success({
        canAdd: currentCount < maxCount,
        currentCount,
        maxCount,
      });
    }

    return fail("Geçersiz action parametresi");
  } catch (error) {
    console.error("Subscription GET error:", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "validate-coupon") {
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
    }

    // Authenticated actions below
    const { user, error } = await requireRoles(req, ["Owner"]);
    if (error) return error;

    if (action === "purchase") {
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
      const paymentAmount = Math.round(totalAmount * 100); // kuruş

      const hashStr =
        merchantId +
        userIp +
        merchantOid +
        (user!.email || "") +
        paymentAmount +
        userBasket +
        "0" + // no_installment
        "0" + // max_installment
        "TL" +
        "1"; // test_mode

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
          // Create pending subscription
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
    }

    if (action === "start-trial") {
      // Check if already had a trial
      const existingTrial = await prisma.tenantSubscriptions.findFirst({
        where: { TenantId: user!.tenantId, IsTrialPeriod: true },
      });

      if (existingTrial) return fail("Deneme süresi daha önce kullanılmış");

      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 14);

      // Find the basic plan or first plan
      const plan = await prisma.subscriptionPlans.findFirst({
        where: { IsActive: true },
        orderBy: { MonthlyPrice: "asc" },
      });

      if (!plan) return fail("Abonelik planı bulunamadı");

      const subscription = await prisma.tenantSubscriptions.create({
        data: {
          TenantId: user!.tenantId,
          SubscriptionPlanId: plan.Id,
          PriceSold: 0,
          StartDate: now,
          EndDate: trialEnd,
          IsActive: true,
          IsTrialPeriod: true,
          TrialEndDate: trialEnd,
          PaymentStatus: "Trial",
          CUser: user!.id,
          CDate: now,
        },
      });

      // Update tenant's subscription plan
      await prisma.tenants.update({
        where: { Id: user!.tenantId },
        data: { SubscriptionPlanId: plan.Id },
      });

      return success(subscription, "14 günlük deneme süresi başlatıldı");
    }

    if (action === "cancel") {
      const subscription = await prisma.tenantSubscriptions.findFirst({
        where: { TenantId: user!.tenantId, IsActive: true, IsCancelled: false },
        orderBy: { StartDate: "desc" },
      });

      if (!subscription) return fail("Aktif abonelik bulunamadı");

      await prisma.tenantSubscriptions.update({
        where: { Id: subscription.Id },
        data: {
          IsCancelled: true,
          CancelledDate: new Date(),
          CancelReason: body.reason || null,
          AutoRenew: false,
          UUser: user!.id,
          UDate: new Date(),
        },
      });

      return success(null, "Abonelik iptal edildi. Süreniz dolana kadar kullanmaya devam edebilirsiniz.");
    }

    return fail("Geçersiz action");
  } catch (error) {
    console.error("Subscription POST error:", error);
    return serverError();
  }
}
