import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { paginatedResponse, getPaginationParams } from "@/lib/pagination";

/**
 * GET /api/customer
 * List customers with pagination and search.
 * Auth required, SubscriptionRequired, Roles: Owner, Staff, Admin.
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const { page, pageSize, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {
      TenantId: user!.tenantId,
      IsActive: true,
    };

    if (search) {
      where.OR = [
        { Name: { contains: search } },
        { Surname: { contains: search } },
        { Phone: { contains: search } },
        { Email: { contains: search } },
      ];
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customers.findMany({
        where,
        select: {
          Id: true,
          Name: true,
          Surname: true,
          Phone: true,
          Email: true,
          LoyaltyPoints: true,
          TotalSpent: true,
          TotalVisits: true,
          CustomerSince: true,
          Tags: true,
          LastVisitDate: true,
          _count: {
            select: {
              Appointments: true,
            },
          },
        },
        orderBy: { Name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.customers.count({ where }),
    ]);

    const items = customers.map((c) => ({
      id: c.Id,
      name: c.Name,
      surname: c.Surname,
      phone: c.Phone,
      email: c.Email,
      totalAppointments: c._count.Appointments,
      lastAppointmentDate: c.LastVisitDate,
      loyaltyPoints: c.LoyaltyPoints,
      totalSpent: c.TotalSpent,
      totalVisits: c.TotalVisits,
      customerSince: c.CustomerSince,
      tags: c.Tags,
    }));

    return success(paginatedResponse(items, totalCount, page, pageSize));
  } catch (error) {
    console.error("List customers error:", error);
    return serverError();
  }
}

/**
 * POST /api/customer
 * Create a new customer.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
    if (error) return error;

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

    if (!name || !surname || !phone) {
      return fail("Ad, soyad ve telefon zorunludur.", "VALIDATION_ERROR");
    }

    // Check duplicate phone for this tenant
    const existing = await prisma.customers.findFirst({
      where: {
        TenantId: user!.tenantId,
        Phone: phone,
        IsActive: true,
      },
    });

    if (existing) {
      return fail("Bu telefon numarası ile kayıtlı müşteri zaten mevcut.", "DUPLICATE_PHONE");
    }

    const customer = await prisma.customers.create({
      data: {
        TenantId: user!.tenantId,
        Name: name,
        Surname: surname,
        Phone: phone,
        Email: email || null,
        BirthDate: birthDate ? new Date(birthDate) : null,
        Notes: notes || null,
        Allergies: allergies || null,
        Preferences: preferences || null,
        ReferralSource: referralSource || null,
        PreferredStaffId: preferredStaffId || null,
        Tags: tags || null,
        CustomerSince: new Date(),
        LoyaltyPoints: 0,
        TotalSpent: 0,
        TotalVisits: 0,
        CUser: user!.id,
        CDate: new Date(),
        IsActive: true,
      },
    });

    return success(
      {
        id: customer.Id,
        name: customer.Name,
        surname: customer.Surname,
        phone: customer.Phone,
        email: customer.Email,
      },
      "Müşteri başarıyla oluşturuldu."
    );
  } catch (error) {
    console.error("Create customer error:", error);
    return serverError("Müşteri oluşturulurken bir hata oluştu.");
  }
}
