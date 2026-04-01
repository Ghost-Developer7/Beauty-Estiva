import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "./prisma";
import { unauthorized, forbidden } from "./api-response";

export interface AuthUser {
  id: number;
  tenantId: number;
  email: string;
  name: string;
  surname: string;
  roles: string[];
}

/**
 * Extract authenticated user from JWT token (Bearer header or cookie).
 * Compatible with both the custom login endpoint JWT and NextAuth JWT.
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  let token: string | undefined;

  // Try Bearer header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // Fallback to cookie
  if (!token) {
    token = req.cookies.get("estiva-token")?.value;
  }

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: "BeautyWiseAPI",
      audience: "BeautyWiseApp",
    });

    const userId = Number(payload.sub);
    const tenantId = Number(payload.tenantId);

    // Get user details and roles from DB for fresh data
    const user = await prisma.users.findUnique({
      where: { Id: userId },
      include: {
        UserRoles: {
          include: { Roles: true },
        },
      },
    });

    if (!user || user.IsActive === false) return null;

    const roles = user.UserRoles.map((ur) => ur.Roles.Name).filter(Boolean) as string[];

    return {
      id: userId,
      tenantId,
      email: user.Email || "",
      name: user.Name,
      surname: user.Surname,
      roles,
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication. Returns the user or a 401 response.
 */
export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return { user: null as AuthUser | null, error: unauthorized() };
  }
  return { user, error: null };
}

/**
 * Require specific roles. Returns the user or a 403 response.
 */
export async function requireRoles(req: NextRequest, allowedRoles: string[]) {
  const { user, error } = await requireAuth(req);
  if (error) return { user: null as AuthUser | null, error };

  if (user!.roles.includes("SuperAdmin")) {
    return { user: user!, error: null };
  }

  const hasRole = user!.roles.some((role) => allowedRoles.includes(role));
  if (!hasRole) {
    return { user: null as AuthUser | null, error: forbidden() };
  }

  return { user: user!, error: null };
}

/**
 * Check if tenant has an active subscription.
 */
export async function checkSubscription(tenantId: number) {
  const subscription = await prisma.tenantSubscriptions.findFirst({
    where: {
      TenantId: tenantId,
      IsActive: true,
      OR: [
        { EndDate: { gte: new Date() } },
        {
          IsTrialPeriod: true,
          TrialEndDate: { gte: new Date() },
        },
      ],
    },
  });

  return !!subscription;
}

/**
 * Require auth + active subscription. SuperAdmin is exempt.
 */
export async function requireSubscription(req: NextRequest, allowedRoles?: string[]) {
  const roles = allowedRoles || ["Owner", "Admin", "Staff"];
  const { user, error } = await requireRoles(req, roles);
  if (error) return { user: null as AuthUser | null, error };

  if (!user!.roles.includes("SuperAdmin")) {
    const hasSubscription = await checkSubscription(user!.tenantId);
    if (!hasSubscription) {
      return {
        user: null as AuthUser | null,
        error: forbidden("Aktif aboneliğiniz bulunmuyor. Lütfen bir abonelik planı satın alın."),
      };
    }
  }

  return { user: user!, error: null };
}
