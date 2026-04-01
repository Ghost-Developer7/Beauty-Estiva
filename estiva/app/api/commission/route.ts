import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { paginatedResponse, getPaginationParams } from "@/lib/pagination";

// GET /api/commission — Commission endpoints via action query param
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action");

    if (!action) {
      return fail("action parametresi zorunludur (rates, records, summary, my).");
    }

    switch (action) {
      case "rates": {
        // Get all commission rates: StaffTreatmentCommissions + Users.DefaultCommissionRate
        const [treatmentCommissions, staffUsers] = await Promise.all([
          prisma.staffTreatmentCommissions.findMany({
            where: { TenantId: user!.tenantId, IsActive: true },
            include: {
              Users: { select: { Id: true, Name: true, Surname: true, DefaultCommissionRate: true } },
              Treatments: { select: { Id: true, Name: true } },
            },
            orderBy: [{ StaffId: "asc" }, { TreatmentId: "asc" }],
          }),
          prisma.users.findMany({
            where: { TenantId: user!.tenantId, IsActive: true },
            select: { Id: true, Name: true, Surname: true, DefaultCommissionRate: true },
          }),
        ]);

        return success({
          treatmentCommissions,
          staffDefaultRates: staffUsers.map((u) => ({
            staffId: u.Id,
            staffName: `${u.Name} ${u.Surname}`,
            defaultCommissionRate: u.DefaultCommissionRate,
          })),
        });
      }

      case "records": {
        const { page, pageSize, skip } = getPaginationParams(searchParams);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const staffId = searchParams.get("staffId");
        const isPaid = searchParams.get("isPaid");

        const where: any = {
          TenantId: user!.tenantId,
          IsActive: true,
        };

        if (staffId) where.StaffId = parseInt(staffId);
        if (isPaid !== null && isPaid !== undefined && isPaid !== "") {
          where.IsPaid = isPaid === "true";
        }
        if (startDate || endDate) {
          where.CDate = {};
          if (startDate) where.CDate.gte = new Date(startDate);
          if (endDate) where.CDate.lte = new Date(endDate);
        }

        const [records, totalCount] = await Promise.all([
          prisma.staffCommissionRecords.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { CDate: "desc" },
            include: {
              Users: { select: { Id: true, Name: true, Surname: true } },
              AppointmentPayments: {
                select: {
                  Id: true,
                  Amount: true,
                  AmountInTry: true,
                  PaidAt: true,
                  Appointments: {
                    select: {
                      Customers: { select: { Name: true, Surname: true } },
                      Treatments: { select: { Name: true } },
                    },
                  },
                },
              },
            },
          }),
          prisma.staffCommissionRecords.count({ where }),
        ]);

        return success(paginatedResponse(records, totalCount, page, pageSize));
      }

      case "summary": {
        // Commission summary per staff
        const records = await prisma.staffCommissionRecords.findMany({
          where: { TenantId: user!.tenantId, IsActive: true },
          include: {
            Users: { select: { Id: true, Name: true, Surname: true } },
          },
        });

        const summaryMap: Record<number, {
          staffId: number;
          staffName: string;
          totalEarned: number;
          totalPaid: number;
          unpaid: number;
        }> = {};

        for (const r of records) {
          if (!summaryMap[r.StaffId]) {
            summaryMap[r.StaffId] = {
              staffId: r.StaffId,
              staffName: `${r.Users.Name} ${r.Users.Surname}`,
              totalEarned: 0,
              totalPaid: 0,
              unpaid: 0,
            };
          }
          const amt = Number(r.CommissionAmountInTry);
          summaryMap[r.StaffId].totalEarned += amt;
          if (r.IsPaid) {
            summaryMap[r.StaffId].totalPaid += amt;
          } else {
            summaryMap[r.StaffId].unpaid += amt;
          }
        }

        return success(Object.values(summaryMap));
      }

      case "my": {
        // Current user's commission summary
        const myRecords = await prisma.staffCommissionRecords.findMany({
          where: {
            TenantId: user!.tenantId,
            StaffId: user!.id,
            IsActive: true,
          },
        });

        let totalEarned = 0;
        let totalPaid = 0;
        let unpaid = 0;

        for (const r of myRecords) {
          const amt = Number(r.CommissionAmountInTry);
          totalEarned += amt;
          if (r.IsPaid) {
            totalPaid += amt;
          } else {
            unpaid += amt;
          }
        }

        return success({
          staffId: user!.id,
          staffName: `${user!.name} ${user!.surname}`,
          totalEarned,
          totalPaid,
          unpaid,
          recordCount: myRecords.length,
        });
      }

      default:
        return fail("Geçersiz action. Geçerli değerler: rates, records, summary, my");
    }
  } catch (err) {
    console.error("Commission GET error:", err);
    return serverError();
  }
}

// PUT /api/commission — Update commission rates
export async function PUT(req: NextRequest) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const body = await req.json();
    const { staffId, rates } = body;

    if (!staffId || !rates || !Array.isArray(rates)) {
      return fail("staffId ve rates dizisi zorunludur.");
    }

    const now = new Date();

    for (const rate of rates) {
      const { treatmentId, commissionRate } = rate;
      if (!treatmentId || commissionRate === undefined) continue;

      // Upsert: find existing or create
      const existing = await prisma.staffTreatmentCommissions.findFirst({
        where: {
          TenantId: user!.tenantId,
          StaffId: staffId,
          TreatmentId: treatmentId,
          IsActive: true,
        },
      });

      if (existing) {
        await prisma.staffTreatmentCommissions.update({
          where: { Id: existing.Id },
          data: {
            CommissionRate: commissionRate,
            UUser: user!.id,
            UDate: now,
          },
        });
      } else {
        await prisma.staffTreatmentCommissions.create({
          data: {
            TenantId: user!.tenantId,
            StaffId: staffId,
            TreatmentId: treatmentId,
            CommissionRate: commissionRate,
            CUser: user!.id,
            CDate: now,
            UUser: user!.id,
            UDate: now,
            IsActive: true,
          },
        });
      }
    }

    return success(null, "Komisyon oranları güncellendi.");
  } catch (err) {
    console.error("Commission update error:", err);
    return serverError();
  }
}

// POST /api/commission — Mark commission records as paid
export async function POST(req: NextRequest) {
  const { user, error } = await requireSubscription(req, ["Owner", "Admin"]);
  if (error) return error;

  try {
    const body = await req.json();
    const { recordIds, staffId, startDate, endDate } = body;

    const now = new Date();

    if (recordIds && Array.isArray(recordIds) && recordIds.length > 0) {
      // Mark specific records as paid
      await prisma.staffCommissionRecords.updateMany({
        where: {
          Id: { in: recordIds },
          TenantId: user!.tenantId,
          IsActive: true,
          IsPaid: false,
        },
        data: {
          IsPaid: true,
          PaidAt: now,
          UUser: user!.id,
          UDate: now,
        },
      });

      return success(null, `${recordIds.length} komisyon kaydı ödendi olarak işaretlendi.`);
    }

    if (staffId && startDate && endDate) {
      // Mark by staff and date range
      const result = await prisma.staffCommissionRecords.updateMany({
        where: {
          TenantId: user!.tenantId,
          StaffId: staffId,
          IsActive: true,
          IsPaid: false,
          CDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        data: {
          IsPaid: true,
          PaidAt: now,
          UUser: user!.id,
          UDate: now,
        },
      });

      return success(null, `${result.count} komisyon kaydı ödendi olarak işaretlendi.`);
    }

    return fail("recordIds dizisi veya staffId + startDate + endDate bilgisi gereklidir.");
  } catch (err) {
    console.error("Commission pay error:", err);
    return serverError();
  }
}
