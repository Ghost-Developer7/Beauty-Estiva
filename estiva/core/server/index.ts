/**
 * @module core/server
 * Central export for all server-side API utilities.
 *
 * Import everything from this single entry point:
 *   import { Response, Auth, Pagination, RouteHandler, DateRange, Guard } from "@/core/server";
 */

export { Response, ErrorCode } from "./Response";
export type { ApiEnvelope, ErrorCodeValue } from "./Response";

export { Auth } from "./Auth";
export type { AuthUser, AuthResult } from "./Auth";

export { Pagination } from "./Pagination";
export type { PageOptions, PageResult } from "./Pagination";

export { RouteHandler } from "./RouteHandler";

export { DateRange } from "./DateRange";
export type { Range } from "./DateRange";

export { Guard } from "./Guard";
