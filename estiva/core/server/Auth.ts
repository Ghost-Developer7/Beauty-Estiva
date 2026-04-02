/**
 * @module Auth
 * Authentication and role-based authorization guard.
 *
 * Resolves JWT tokens from Bearer headers or cookies, fetches fresh user data
 * from the database on every request (roles can change without token reissue),
 * and enforces tenant isolation and subscription status.
 *
 * Usage:
 *   const { user, error } = await Auth.requireSubscription(req);
 *   if (error) return error;
 *
 *   const { user, error } = await Auth.requireRole(req, ["Owner", "Admin"]);
 *   if (error) return error;
 */

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { Response } from "./Response";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Authenticated user attached to every request context. */
export interface AuthUser {
  id: number;
  tenantId: number;
  email: string;
  name: string;
  surname: string;
  /** Full display name derived from name + surname. */
  fullName: string;
  roles: string[];
}

/** Return type of every Auth guard method. */
export type AuthResult =
  | { user: AuthUser; error: null }
  | { user: null; error: NextResponse };

// ─── Constants ────────────────────────────────────────────────────────────────

/** Roles that bypass subscription checks and most permission gates. */
const SUPER_ROLES = ["SuperAdmin"] as const;

/** Default roles allowed by requireSubscription. */
const DEFAULT_ALLOWED_ROLES = ["Owner", "Admin", "Staff"] as const;

// ─── Auth class ───────────────────────────────────────────────────────────────

export class Auth {
  /**
   * Resolve the authenticated user from the incoming request.
   * Checks the Bearer Authorization header first, then falls back to the
   * `estiva-token` cookie. Returns null if the token is missing or invalid.
   */
  static async resolveUser(req: NextRequest): Promise<AuthUser | null> {
    const token = Auth._extractToken(req);
    if (!token) return null;

    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      const { payload } = await jwtVerify(token, secret, {
        issuer: "BeautyWiseAPI",
        audience: "BeautyWiseApp",
      });

      const userId = Number(payload.sub);
      const tenantId = Number(payload.tenantId);

      // Always fetch fresh user data — roles may have changed since token issue
      const dbUser = await prisma.users.findUnique({
        where: { Id: userId },
        include: { UserRoles: { include: { Roles: true } } },
      });

      if (!dbUser || !dbUser.IsActive) return null;

      const roles = dbUser.UserRoles.map((ur) => ur.Roles.Name).filter(
        Boolean,
      ) as string[];

      return {
        id: userId,
        tenantId,
        email: dbUser.Email ?? "",
        name: dbUser.Name,
        surname: dbUser.Surname,
        fullName: `${dbUser.Name} ${dbUser.Surname}`,
        roles,
      };
    } catch {
      return null;
    }
  }

  /**
   * Require a valid JWT. Returns 401 if the token is missing or expired.
   */
  static async requireAuth(req: NextRequest): Promise<AuthResult> {
    const user = await Auth.resolveUser(req);
    if (!user) return { user: null, error: Response.unauthorized() };
    return { user, error: null };
  }

  /**
   * Require at least one of the specified roles.
   * SuperAdmins always pass regardless of the role list.
   * Returns 401 if unauthenticated, 403 if the user lacks the required role.
   */
  static async requireRole(
    req: NextRequest,
    allowedRoles: string[],
  ): Promise<AuthResult> {
    const { user, error } = await Auth.requireAuth(req);
    if (error) return { user: null, error };

    if (Auth._isSuperAdmin(user)) return { user, error: null };

    const hasPermission = user.roles.some((r) => allowedRoles.includes(r));
    if (!hasPermission) return { user: null, error: Response.forbidden() };

    return { user, error: null };
  }

  /**
   * Require authentication + an active tenant subscription.
   * Optionally restrict to specific roles (defaults to Owner, Admin, Staff).
   * SuperAdmins bypass both role and subscription checks.
   */
  static async requireSubscription(
    req: NextRequest,
    allowedRoles: string[] = [...DEFAULT_ALLOWED_ROLES],
  ): Promise<AuthResult> {
    const { user, error } = await Auth.requireRole(req, allowedRoles);
    if (error) return { user: null, error };

    if (Auth._isSuperAdmin(user)) return { user, error: null };

    const hasActiveSubscription = await Auth._checkSubscription(user.tenantId);
    if (!hasActiveSubscription) {
      return {
        user: null,
        error: Response.forbidden(
          "No active subscription found. Please purchase a subscription plan.",
        ),
      };
    }

    return { user, error: null };
  }

  /**
   * Check whether a tenant has an active paid subscription or trial.
   * Public surface — useful for subscription-gating UI elements.
   */
  static async isSubscriptionActive(tenantId: number): Promise<boolean> {
    return Auth._checkSubscription(tenantId);
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private static _extractToken(req: NextRequest): string | undefined {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
    return req.cookies.get("estiva-token")?.value;
  }

  private static _isSuperAdmin(user: AuthUser): boolean {
    return SUPER_ROLES.some((r) => user.roles.includes(r));
  }

  private static async _checkSubscription(tenantId: number): Promise<boolean> {
    const now = new Date();
    const active = await prisma.tenantSubscriptions.findFirst({
      where: {
        TenantId: tenantId,
        IsActive: true,
        OR: [
          { EndDate: { gte: now } },
          { IsTrialPeriod: true, TrialEndDate: { gte: now } },
        ],
      },
    });
    return !!active;
  }
}
