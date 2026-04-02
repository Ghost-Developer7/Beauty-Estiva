/**
 * @deprecated Import from "@/core/server" instead.
 *
 * This file is kept for backward compatibility.
 * All logic now lives in library/backend/Auth.ts.
 */

import { NextRequest } from "next/server";
import { Auth, AuthUser } from "@/core/server/Auth";

export type { AuthUser };

export const getAuthUser = (req: NextRequest) => Auth.resolveUser(req);

export const requireAuth = (req: NextRequest) => Auth.requireAuth(req);

export const requireRoles = (req: NextRequest, allowedRoles: string[]) =>
  Auth.requireRole(req, allowedRoles);

export const requireSubscription = (
  req: NextRequest,
  allowedRoles?: string[],
) => Auth.requireSubscription(req, allowedRoles);

export const checkSubscription = (tenantId: number) =>
  Auth.isSubscriptionActive(tenantId);
