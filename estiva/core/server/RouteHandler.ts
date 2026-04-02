/**
 * @module RouteHandler
 * Higher-order wrapper for Next.js route handlers.
 *
 * Eliminates the boilerplate try/catch + serverError pattern that every route
 * would otherwise repeat. The wrapper catches unhandled errors, logs them with
 * a route identifier, and returns a consistent 500 response.
 *
 * Usage:
 *   export const GET = RouteHandler.wrap("appointments/GET", async (req) => {
 *     // ... handler body — no try/catch needed
 *     return Response.ok(data);
 *   });
 */

import { NextRequest, NextResponse } from "next/server";
import { Response } from "./Response";

// ─── Types ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyContext = any;
type HandlerFn = (req: NextRequest, ctx: AnyContext) => Promise<NextResponse>;

// ─── RouteHandler class ───────────────────────────────────────────────────────

export class RouteHandler {
  /**
   * Wrap a handler function with error boundary logic.
   *
   * Catches any unhandled exception, logs it with the route label, and returns
   * a consistent 500 response so the server never crashes silently.
   *
   * @param label   Human-readable route identifier for error logs.
   *                Convention: "resource/METHOD" — e.g. "appointments/GET"
   * @param handler The actual route handler implementation.
   *
   * @example
   *   export const GET = RouteHandler.wrap("appointments GET", async (req) => {
   *     const { user, error } = await Auth.requireSubscription(req);
   *     if (error) return error;
   *     return Response.ok(data);
   *   });
   */
  static wrap(label: string, handler: HandlerFn): HandlerFn {
    return async (req: NextRequest, ctx: AnyContext): Promise<NextResponse> => {
      try {
        return await handler(req, ctx);
      } catch (err) {
        console.error(`[${label}] Unhandled error:`, err);
        return Response.serverError();
      }
    };
  }
}
