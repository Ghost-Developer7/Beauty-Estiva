/**
 * @module Response
 * Unified HTTP response builder for all API route handlers.
 *
 * Every response follows the same envelope:
 * {
 *   success : boolean
 *   data    : T | null
 *   error   : { code: string; message: string } | null
 *   message : string | null
 * }
 *
 * Usage:
 *   return Response.ok(user);
 *   return Response.notFound("User not found");
 *   return Response.serverError();
 */

import { NextResponse } from "next/server";

// ─── Envelope type ────────────────────────────────────────────────────────────

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  message: string | null;
}

// ─── Error codes ──────────────────────────────────────────────────────────────

export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  SERVER_ERROR: "SERVER_ERROR",
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

// ─── Response class ───────────────────────────────────────────────────────────

export class Response {
  // ── 2xx Success ─────────────────────────────────────────────────────────────

  /** 200 — Resource returned successfully. */
  static ok<T>(data: T, message?: string): NextResponse<ApiEnvelope<T>> {
    return NextResponse.json(
      { success: true, data, error: null, message: message ?? null },
      { status: 200 },
    );
  }

  /** 201 — Resource created successfully. */
  static created<T>(data: T, message?: string): NextResponse<ApiEnvelope<T>> {
    return NextResponse.json(
      { success: true, data, error: null, message: message ?? null },
      { status: 201 },
    );
  }

  /** 204 — Action succeeded with no response body. */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  // ── 4xx Client errors ────────────────────────────────────────────────────────

  /** 400 — Invalid input or business rule violation. */
  static badRequest(
    message: string,
    code: string = ErrorCode.VALIDATION_ERROR,
  ): NextResponse<ApiEnvelope<null>> {
    return Response._error(message, code, 400);
  }

  /** 401 — Missing or invalid authentication token. */
  static unauthorized(
    message = "Authentication required",
  ): NextResponse<ApiEnvelope<null>> {
    return Response._error(message, ErrorCode.UNAUTHORIZED, 401);
  }

  /** 403 — Authenticated but not permitted to perform this action. */
  static forbidden(
    message = "You do not have permission to perform this action",
  ): NextResponse<ApiEnvelope<null>> {
    return Response._error(message, ErrorCode.FORBIDDEN, 403);
  }

  /** 404 — Requested resource does not exist. */
  static notFound(
    message = "Resource not found",
  ): NextResponse<ApiEnvelope<null>> {
    return Response._error(message, ErrorCode.NOT_FOUND, 404);
  }

  /** 409 — State conflict (e.g. duplicate record). */
  static conflict(
    message: string,
    code: string = ErrorCode.CONFLICT,
  ): NextResponse<ApiEnvelope<null>> {
    return Response._error(message, code, 409);
  }

  // ── 5xx Server errors ────────────────────────────────────────────────────────

  /** 500 — Unexpected server-side failure. */
  static serverError(
    message = "An unexpected error occurred. Please try again later.",
  ): NextResponse<ApiEnvelope<null>> {
    return Response._error(message, ErrorCode.SERVER_ERROR, 500);
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private static _error(
    message: string,
    code: string,
    status: number,
  ): NextResponse<ApiEnvelope<null>> {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code, message },
        message,
      },
      { status },
    );
  }
}
