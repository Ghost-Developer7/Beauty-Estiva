const SUPER_ADMIN_ROLE = "SuperAdmin";

const OWNER_ASSIGNABLE_ROLES = new Set(["Owner", "Admin", "Staff"]);
const SUPER_ADMIN_ASSIGNABLE_ROLES = new Set([
  SUPER_ADMIN_ROLE,
  "Owner",
  "Admin",
  "Staff",
]);

interface ValidateStaffRoleChangeInput {
  actorUserId: number;
  actorRoles: string[];
  targetUserId: number;
  targetRoles: string[];
  requestedRole: string;
}

export function extractRequestedStaffRole(body: {
  role?: unknown;
  newRole?: unknown;
}): string {
  if (typeof body.role === "string") {
    return body.role.trim();
  }

  if (typeof body.newRole === "string") {
    return body.newRole.trim();
  }

  return "";
}

export function validateStaffRoleChange({
  actorUserId,
  actorRoles,
  targetUserId,
  targetRoles,
  requestedRole,
}: ValidateStaffRoleChangeInput):
  | { ok: true }
  | { ok: false; code: string; message: string; status: number } {
  if (!requestedRole) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Rol alanı zorunludur.",
      status: 400,
    };
  }

  if (actorUserId === targetUserId) {
    return {
      ok: false,
      code: "SELF_ROLE_CHANGE",
      message: "Kendi rolünüzü değiştiremezsiniz.",
      status: 403,
    };
  }

  const isSuperAdmin = actorRoles.includes(SUPER_ADMIN_ROLE);
  const assignableRoles = isSuperAdmin
    ? SUPER_ADMIN_ASSIGNABLE_ROLES
    : OWNER_ASSIGNABLE_ROLES;

  if (!assignableRoles.has(requestedRole)) {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "Bu rolü atama yetkiniz yok.",
      status: 403,
    };
  }

  if (!isSuperAdmin && targetRoles.includes(SUPER_ADMIN_ROLE)) {
    return {
      ok: false,
      code: "FORBIDDEN",
      message: "SuperAdmin kullanıcılarının rolü değiştirilemez.",
      status: 403,
    };
  }

  return { ok: true };
}
