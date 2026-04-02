/**
 * @deprecated Import from "@/core/server" instead.
 *
 * This file is kept for backward compatibility.
 * All logic now lives in library/backend/Response.ts.
 */

import { Response, ApiEnvelope } from "@/core/server/Response";

// Re-export the envelope type under the old name
export type ApiResponse<T> = ApiEnvelope<T>;

// Re-export named helpers that existing routes use
export const success = <T>(data: T, message?: string) =>
  Response.ok(data, message);

export const fail = (
  message: string,
  errorCode = "ERROR",
  status = 400,
) => {
  if (status === 401) return Response.unauthorized(message);
  if (status === 403) return Response.forbidden(message);
  if (status === 404) return Response.notFound(message);
  if (status === 500) return Response.serverError(message);
  return Response.badRequest(message, errorCode);
};

export const unauthorized = (message?: string) =>
  Response.unauthorized(message);

export const forbidden = (message?: string) =>
  Response.forbidden(message);

export const notFound = (message?: string) =>
  Response.notFound(message);

export const serverError = (message?: string) =>
  Response.serverError(message);
