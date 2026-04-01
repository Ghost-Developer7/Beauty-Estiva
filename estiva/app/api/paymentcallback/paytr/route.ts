import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const merchantOid = formData.get("merchant_oid") as string;
    const status = formData.get("status") as string;
    const totalAmount = formData.get("total_amount") as string;
    const hash = formData.get("hash") as string;

    const merchantKey = process.env.PAYTR_MERCHANT_KEY || "";
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT || "";

    // Verify hash
    const hashStr = merchantOid + merchantSalt + status + totalAmount;
    const expectedHash = crypto
      .createHmac("sha256", merchantKey)
      .update(hashStr)
      .digest("base64");

    if (hash !== expectedHash) {
      console.error("PayTR hash verification failed");
      return new NextResponse("HASH_MISMATCH", { status: 400 });
    }

    const now = new Date();

    if (status === "success") {
      // Find the pending subscription by merchantOid
      const subscription = await prisma.tenantSubscriptions.findFirst({
        where: { PaymentTransactionId: merchantOid },
      });

      if (subscription) {
        // Activate subscription
        await prisma.tenantSubscriptions.update({
          where: { Id: subscription.Id },
          data: {
            IsActive: true,
            PaymentStatus: "Completed",
            UDate: now,
          },
        });

        // Update tenant's subscription plan
        await prisma.tenants.update({
          where: { Id: subscription.TenantId },
          data: { SubscriptionPlanId: subscription.SubscriptionPlanId },
        });

        // Create payment history
        await prisma.tenantPaymentHistories.create({
          data: {
            TenantId: subscription.TenantId,
            Amount: Number(totalAmount) / 100, // kuruş to TL
            PaymentDate: now,
            TransactionId: merchantOid,
            PaymentStatus: "Success",
            Description: "Abonelik ödemesi",
            SubscriptionId: subscription.Id,
            PaymentMethod: "PayTR",
            CDate: now,
            IsActive: true,
          },
        });

        // Increment coupon usage if applicable
        if (subscription.CouponId) {
          await prisma.coupons.update({
            where: { Id: subscription.CouponId },
            data: { CurrentUsageCount: { increment: 1 } },
          });

          await prisma.couponUsages.create({
            data: {
              CouponId: subscription.CouponId,
              TenantId: subscription.TenantId,
              SubscriptionId: subscription.Id,
              OriginalPrice: Number(subscription.PriceSold) + Number(subscription.DiscountAmount || 0),
              DiscountAmount: Number(subscription.DiscountAmount || 0),
              FinalPrice: Number(subscription.PriceSold),
              UsedDate: now,
              CDate: now,
              IsActive: true,
            },
          });
        }
      }
    } else {
      // Payment failed
      const subscription = await prisma.tenantSubscriptions.findFirst({
        where: { PaymentTransactionId: merchantOid },
      });

      if (subscription) {
        await prisma.tenantSubscriptions.update({
          where: { Id: subscription.Id },
          data: {
            PaymentStatus: "Failed",
            FailedPaymentAttempts: { increment: 1 },
            UDate: now,
          },
        });

        // Create failed payment history
        await prisma.tenantPaymentHistories.create({
          data: {
            TenantId: subscription.TenantId,
            Amount: Number(totalAmount) / 100,
            PaymentDate: now,
            TransactionId: merchantOid,
            PaymentStatus: "Failed",
            Description: "Başarısız abonelik ödemesi",
            SubscriptionId: subscription.Id,
            PaymentMethod: "PayTR",
            CDate: now,
            IsActive: true,
          },
        });
      }
    }

    // PayTR requires "OK" as plain text response
    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("PayTR callback error:", error);
    return new NextResponse("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
