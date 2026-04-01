import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, fail, serverError } from "@/lib/api-response";
import { requireSubscription } from "@/lib/api-middleware";
import { paginatedResponse, getPaginationParams } from "@/lib/pagination";

const APPOINTMENT_STATUS_MAP: Record<number, string> = {
  1: "Scheduled",
  2: "Confirmed",
  3: "Completed",
  4: "Cancelled",
  5: "NoShow",
};

function mapAppointmentToListItem(a: any) {
  return {
    id: a.Id,
    customerId: a.CustomerId,
    customerFullName: a.Customers ? `${a.Customers.Name} ${a.Customers.Surname}` : "",
    customerPhone: a.Customers?.Phone || "",
    staffId: a.StaffId,
    staffFullName: a.Users ? `${a.Users.Name} ${a.Users.Surname}` : "",
    treatmentId: a.TreatmentId,
    treatmentName: a.Treatments?.Name || "",
    treatmentColor: a.Treatments?.Color || null,
    durationMinutes: a.Treatments?.DurationMinutes || 0,
    startTime: a.StartTime,
    endTime: a.EndTime,
    status: APPOINTMENT_STATUS_MAP[a.Status] || "Scheduled",
    notes: a.Notes,
    isRecurring: a.IsRecurring || false,
    sessionNumber: a.SessionNumber || 1,
    totalSessions: a.TotalSessions || null,
    parentAppointmentId: a.ParentAppointmentId || null,
  };
}

// GET /api/appointment — List appointments with filters
export async function GET(req: NextRequest) {
  const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
  if (error) return error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const pageParam = searchParams.get("page") || searchParams.get("pageNumber");
    const { page, pageSize, skip } = getPaginationParams(searchParams);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const staffId = searchParams.get("staffId");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const where: any = {
      TenantId: user!.tenantId,
      IsActive: true,
    };

    if (startDate) {
      // Treat date as Turkey timezone (UTC+3) — start of day
      const start = new Date(startDate + "T00:00:00+03:00");
      where.StartTime = { ...where.StartTime, gte: start };
    }
    if (endDate) {
      // End of day in Turkey timezone
      const end = new Date(endDate + "T23:59:59.999+03:00");
      where.StartTime = { ...where.StartTime, lte: end };
    }
    if (staffId) {
      where.StaffId = parseInt(staffId);
    }
    if (customerId) {
      where.CustomerId = parseInt(customerId);
    }
    if (status) {
      where.Status = parseInt(status);
    }

    const includeRelations = {
      Customers: {
        select: { Id: true, Name: true, Surname: true, Phone: true },
      },
      Users: {
        select: { Id: true, Name: true, Surname: true },
      },
      Treatments: {
        select: { Id: true, Name: true, DurationMinutes: true, Color: true },
      },
    };

    // If no page param, return flat array for list() calls
    if (!pageParam) {
      const appointments = await prisma.appointments.findMany({
        where,
        orderBy: { StartTime: "desc" },
        include: includeRelations,
      });

      const mapped = appointments.map(mapAppointmentToListItem);
      return success(mapped);
    }

    const [appointments, totalCount] = await Promise.all([
      prisma.appointments.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { StartTime: "desc" },
        include: includeRelations,
      }),
      prisma.appointments.count({ where }),
    ]);

    const mapped = appointments.map(mapAppointmentToListItem);
    return success(paginatedResponse(mapped, totalCount, page, pageSize));
  } catch (err) {
    console.error("Appointment list error:", err);
    return serverError();
  }
}

// POST /api/appointment — Create appointment
export async function POST(req: NextRequest) {
  const { user, error } = await requireSubscription(req, ["Owner", "Staff", "Admin"]);
  if (error) return error;

  try {
    const body = await req.json();
    const {
      customerId,
      staffId,
      treatmentId,
      startTime,
      endTime,
      notes,
      isRecurring,
      recurrenceIntervalDays,
      totalSessions,
    } = body;

    if (!customerId || !staffId || !treatmentId || !startTime || !endTime) {
      return fail("customerId, staffId, treatmentId, startTime ve endTime zorunludur.");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return fail("Bitiş zamanı başlangıç zamanından sonra olmalıdır.");
    }

    // Check for overlapping appointments for the same staff
    const overlap = await prisma.appointments.findFirst({
      where: {
        TenantId: user!.tenantId,
        StaffId: staffId,
        IsActive: true,
        Status: { not: 4 }, // Not cancelled
        OR: [
          { StartTime: { lt: end }, EndTime: { gt: start } },
        ],
      },
    });

    if (overlap) {
      return fail("Bu personelin seçilen zaman aralığında başka bir randevusu bulunmaktadır.", "OVERLAP");
    }

    // Check tenant auto-confirm setting
    const tenant = await prisma.tenants.findUnique({
      where: { Id: user!.tenantId },
      select: { AutoConfirmAppointments: true },
    });

    const initialStatus = tenant?.AutoConfirmAppointments ? 2 : 1; // 2=Confirmed, 1=Scheduled

    const now = new Date();

    const appointment = await prisma.appointments.create({
      data: {
        TenantId: user!.tenantId,
        CustomerId: customerId,
        StaffId: staffId,
        TreatmentId: treatmentId,
        StartTime: start,
        EndTime: end,
        Status: initialStatus,
        Notes: notes || null,
        IsRecurring: isRecurring || false,
        RecurrenceIntervalDays: isRecurring ? recurrenceIntervalDays : null,
        TotalSessions: isRecurring ? totalSessions : null,
        SessionNumber: 1,
        ParentAppointmentId: null,
        CUser: user!.id,
        CDate: now,
        UUser: user!.id,
        UDate: now,
        IsActive: true,
      },
    });

    // If recurring, create child appointments
    if (isRecurring && recurrenceIntervalDays && totalSessions && totalSessions > 1) {
      const childAppointments = [];
      for (let i = 1; i < totalSessions; i++) {
        const childStart = new Date(start);
        childStart.setDate(childStart.getDate() + recurrenceIntervalDays * i);
        const childEnd = new Date(end);
        childEnd.setDate(childEnd.getDate() + recurrenceIntervalDays * i);

        childAppointments.push({
          TenantId: user!.tenantId,
          CustomerId: customerId,
          StaffId: staffId,
          TreatmentId: treatmentId,
          StartTime: childStart,
          EndTime: childEnd,
          Status: initialStatus,
          Notes: notes || null,
          IsRecurring: true,
          RecurrenceIntervalDays: recurrenceIntervalDays,
          TotalSessions: totalSessions,
          SessionNumber: i + 1,
          ParentAppointmentId: appointment.Id,
          CUser: user!.id,
          CDate: now,
          UUser: user!.id,
          UDate: now,
          IsActive: true,
        });
      }

      if (childAppointments.length > 0) {
        await prisma.appointments.createMany({ data: childAppointments });
      }
    }

    return success(appointment, "Randevu başarıyla oluşturuldu.");
  } catch (err) {
    console.error("Appointment create error:", err);
    return serverError();
  }
}
