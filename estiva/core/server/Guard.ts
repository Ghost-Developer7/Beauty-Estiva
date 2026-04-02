/**
 * @module Guard
 * Lightweight helpers that enforce common Prisma query invariants.
 *
 * Centralises:
 *  - Tenant isolation (every query must scope to a single tenant)
 *  - Soft-delete filtering (IsActive = true)
 *  - URL parameter parsing with type-safe validation
 *
 * Usage:
 *   const id = Guard.parseId(params.id);
 *   if (!id) return Response.badRequest("Invalid ID");
 *
 *   const where = { ...Guard.activeTenant(tenantId), CustomerId: id };
 */

// ─── Guard class ──────────────────────────────────────────────────────────────

export class Guard {
  /**
   * Parse a string route/query parameter as a positive integer.
   * Returns null if the string is empty, non-numeric, or ≤ 0.
   *
   * @example
   *   const id = Guard.parseId("42");   // → 42
   *   const id = Guard.parseId("abc");  // → null
   */
  static parseId(value: string | null | undefined): number | null {
    if (!value) return null;
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  /**
   * Base Prisma WHERE clause for active (non-deleted) tenant records.
   * Include this in every findMany / findFirst / count call.
   *
   * @example
   *   prisma.customers.findMany({
   *     where: { ...Guard.activeTenant(tenantId), Name: { contains: q } }
   *   });
   */
  static activeTenant(tenantId: number): { TenantId: number; IsActive: boolean } {
    return { TenantId: tenantId, IsActive: true };
  }

  /**
   * Audit fields to set when creating a new record.
   *
   * @example
   *   prisma.customers.create({
   *     data: { ...payload, ...Guard.createAudit(userId, tenantId) }
   *   });
   */
  static createAudit(
    userId: number,
    tenantId: number,
  ): { TenantId: number; CUser: number; CDate: Date; IsActive: boolean } {
    return {
      TenantId: tenantId,
      CUser: userId,
      CDate: new Date(),
      IsActive: true,
    };
  }

  /**
   * Audit fields to set when updating an existing record.
   *
   * @example
   *   prisma.customers.update({
   *     where: { Id: id },
   *     data: { Name: body.name, ...Guard.updateAudit(userId) }
   *   });
   */
  static updateAudit(userId: number): { UUser: number; UDate: Date } {
    return { UUser: userId, UDate: new Date() };
  }

  /**
   * Soft-delete payload — marks a record as inactive instead of removing it.
   *
   * @example
   *   prisma.customers.update({
   *     where: { Id: id },
   *     data: Guard.softDelete(userId),
   *   });
   */
  static softDelete(
    userId: number,
  ): { IsActive: boolean; UUser: number; UDate: Date } {
    return { IsActive: false, ...Guard.updateAudit(userId) };
  }

  /**
   * Assert that a required string field is non-empty.
   * Returns true if the value is a non-empty string.
   */
  static isPresent(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
  }

  /**
   * Assert that a list of required field names are all truthy on an object.
   * Returns the list of missing field names (empty array = all present).
   *
   * @example
   *   const missing = Guard.requireFields(body, ["staffId", "startDate"]);
   *   if (missing.length) return Response.badRequest(`Missing: ${missing.join(", ")}`);
   */
  static requireFields(
    obj: Record<string, unknown>,
    fields: string[],
  ): string[] {
    return fields.filter((f) => !obj[f] && obj[f] !== 0);
  }
}
