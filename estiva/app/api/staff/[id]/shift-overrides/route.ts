import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Auth, Response, RouteHandler, Guard } from "@/core/server";

type Ctx = { params: Promise<{ id: string }> };

const parseTime = (val: string | null | undefined): Date | null => {
  if (!val) return null;
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d;
  const m = val.match(/^(\d{1,2}):(\d{2})/);
  if (m) return new Date(`1970-01-01T${m[1].padStart(2, "0")}:${m[2]}:00Z`);
  return null;
};

/**
 * GET /api/staff/:id/shift-overrides?year=2026&month=4
 * Returns date-specific shift overrides for a given month.
 */
export const GET = RouteHandler.wrap(
  "staff/[id]/shift-overrides GET",
  async (req: NextRequest, { params }: Ctx) => {
    const { user, error } = await Auth.requireSubscription(req);
    if (error) return error;

    const { id } = await params;
    const staffId = Guard.parseId(id);
    if (!staffId) return Response.badRequest("Geçersiz personel ID");

    const url = new URL(req.url);
    const year = parseInt(url.searchParams.get("year") || "");
    const month = parseInt(url.searchParams.get("month") || "");
    if (!year || !month) return Response.badRequest("year ve month parametreleri gereklidir");

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const overrides = await prisma.staffShiftOverrides.findMany({
      where: {
        StaffId: staffId,
        TenantId: user.tenantId,
        IsActive: true,
        Date: { gte: startDate, lte: endDate },
      },
      orderBy: { Date: "asc" },
    });

    return Response.ok(
      overrides.map((o) => ({
        id: o.Id,
        staffId: o.StaffId,
        date: o.Date.toISOString().slice(0, 10),
        startTime: o.StartTime,
        endTime: o.EndTime,
        breakStartTime: o.BreakStartTime,
        breakEndTime: o.BreakEndTime,
        isWorkingDay: o.IsWorkingDay,
      })),
    );
  },
);

/**
 * PUT /api/staff/:id/shift-overrides
 * Upsert a date-specific shift override.
 */
export const PUT = RouteHandler.wrap(
  "staff/[id]/shift-overrides PUT",
  async (req: NextRequest, { params }: Ctx) => {
    const { user, error } = await Auth.requireRole(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const staffId = Guard.parseId(id);
    if (!staffId) return Response.badRequest("Geçersiz personel ID");

    const body = await req.json();
    const { date, startTime, endTime, breakStartTime, breakEndTime, isWorkingDay } = body;

    if (!date) return Response.badRequest("date alanı gereklidir");

    const dateObj = new Date(date + "T00:00:00Z");
    const now = new Date();

    const existing = await prisma.staffShiftOverrides.findFirst({
      where: {
        StaffId: staffId,
        TenantId: user.tenantId,
        Date: dateObj,
        IsActive: true,
      },
    });

    if (existing) {
      await prisma.staffShiftOverrides.update({
        where: { Id: existing.Id },
        data: {
          StartTime: parseTime(startTime),
          EndTime: parseTime(endTime),
          BreakStartTime: parseTime(breakStartTime),
          BreakEndTime: parseTime(breakEndTime),
          IsWorkingDay: isWorkingDay ?? true,
          UUser: user.id,
          UDate: now,
        },
      });
    } else {
      await prisma.staffShiftOverrides.create({
        data: {
          TenantId: user.tenantId,
          StaffId: staffId,
          Date: dateObj,
          StartTime: parseTime(startTime),
          EndTime: parseTime(endTime),
          BreakStartTime: parseTime(breakStartTime),
          BreakEndTime: parseTime(breakEndTime),
          IsWorkingDay: isWorkingDay ?? true,
          CUser: user.id,
          CDate: now,
          IsActive: true,
        },
      });
    }

    return Response.ok(null, "Vardiya güncellendi");
  },
);

/**
 * DELETE /api/staff/:id/shift-overrides?date=2026-04-15
 * Remove override, reverting to the weekly template.
 */
export const DELETE = RouteHandler.wrap(
  "staff/[id]/shift-overrides DELETE",
  async (req: NextRequest, { params }: Ctx) => {
    const { user, error } = await Auth.requireRole(req, ["Owner", "Admin"]);
    if (error) return error;

    const { id } = await params;
    const staffId = Guard.parseId(id);
    if (!staffId) return Response.badRequest("Geçersiz personel ID");

    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    if (!date) return Response.badRequest("date parametresi gereklidir");

    const dateObj = new Date(date + "T00:00:00Z");

    await prisma.staffShiftOverrides.updateMany({
      where: {
        StaffId: staffId,
        TenantId: user.tenantId,
        Date: dateObj,
        IsActive: true,
      },
      data: Guard.softDelete(user.id),
    });

    return Response.ok(null, "Varsayılan vardiyaya dönüldü");
  },
);
