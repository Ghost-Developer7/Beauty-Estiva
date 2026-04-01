import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, notFound, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/customer/[id]
 * Get customer detail with recent appointments (last 5).
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
    if (error) return error;

    const { id } = await context.params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) return fail("Geçersiz müşteri ID.", "VALIDATION_ERROR");

    const customer = await prisma.customers.findFirst({
      where: {
        Id: customerId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!customer) return notFound("Müşteri bulunamadı.");

    // Get last 5 appointments
    const recentAppointments = await prisma.appointments.findMany({
      where: {
        CustomerId: customerId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
      select: {
        Id: true,
        StartTime: true,
        EndTime: true,
        Status: true,
        Notes: true,
        Treatments: {
          select: { Id: true, Name: true },
        },
        Users: {
          select: { Id: true, Name: true, Surname: true },
        },
      },
      orderBy: { StartTime: "desc" },
      take: 5,
    });

    const data = {
      id: customer.Id,
      name: customer.Name,
      surname: customer.Surname,
      phone: customer.Phone,
      email: customer.Email,
      birthDate: customer.BirthDate,
      notes: customer.Notes,
      allergies: customer.Allergies,
      preferences: customer.Preferences,
      referralSource: customer.ReferralSource,
      preferredStaffId: customer.PreferredStaffId,
      tags: customer.Tags,
      loyaltyPoints: customer.LoyaltyPoints,
      totalSpent: customer.TotalSpent,
      totalVisits: customer.TotalVisits,
      customerSince: customer.CustomerSince,
      lastVisitDate: customer.LastVisitDate,
      recentAppointments: recentAppointments.map((a) => ({
        id: a.Id,
        startTime: a.StartTime,
        endTime: a.EndTime,
        status: a.Status,
        notes: a.Notes,
        treatment: a.Treatments
          ? { id: a.Treatments.Id, name: a.Treatments.Name }
          : null,
        staff: a.Users
          ? { id: a.Users.Id, name: a.Users.Name, surname: a.Users.Surname }
          : null,
      })),
    };

    return success(data);
  } catch (error) {
    console.error("Get customer detail error:", error);
    return serverError();
  }
}

/**
 * PUT /api/customer/[id]
 * Update customer.
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
    if (error) return error;

    const { id } = await context.params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) return fail("Geçersiz müşteri ID.", "VALIDATION_ERROR");

    const existing = await prisma.customers.findFirst({
      where: {
        Id: customerId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!existing) return notFound("Müşteri bulunamadı.");

    const body = await req.json();
    const {
      name,
      surname,
      phone,
      email,
      birthDate,
      notes,
      allergies,
      preferences,
      referralSource,
      preferredStaffId,
      tags,
    } = body;

    const updated = await prisma.customers.update({
      where: { Id: customerId },
      data: {
        ...(name !== undefined && { Name: name }),
        ...(surname !== undefined && { Surname: surname }),
        ...(phone !== undefined && { Phone: phone }),
        ...(email !== undefined && { Email: email }),
        ...(birthDate !== undefined && {
          BirthDate: birthDate ? new Date(birthDate) : null,
        }),
        ...(notes !== undefined && { Notes: notes }),
        ...(allergies !== undefined && { Allergies: allergies }),
        ...(preferences !== undefined && { Preferences: preferences }),
        ...(referralSource !== undefined && { ReferralSource: referralSource }),
        ...(preferredStaffId !== undefined && {
          PreferredStaffId: preferredStaffId,
        }),
        ...(tags !== undefined && { Tags: tags }),
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(
      { id: updated.Id, name: updated.Name, surname: updated.Surname },
      "Müşteri başarıyla güncellendi."
    );
  } catch (error) {
    console.error("Update customer error:", error);
    return serverError("Müşteri güncellenirken bir hata oluştu.");
  }
}

/**
 * DELETE /api/customer/[id]
 * Soft delete customer (set IsActive = false).
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
    if (error) return error;

    const { id } = await context.params;
    const customerId = parseInt(id);
    if (isNaN(customerId)) return fail("Geçersiz müşteri ID.", "VALIDATION_ERROR");

    const existing = await prisma.customers.findFirst({
      where: {
        Id: customerId,
        TenantId: user!.tenantId,
        IsActive: true,
      },
    });

    if (!existing) return notFound("Müşteri bulunamadı.");

    await prisma.customers.update({
      where: { Id: customerId },
      data: {
        IsActive: false,
        UUser: user!.id,
        UDate: new Date(),
      },
    });

    return success(null, "Müşteri başarıyla silindi.");
  } catch (error) {
    console.error("Delete customer error:", error);
    return serverError("Müşteri silinirken bir hata oluştu.");
  }
}
