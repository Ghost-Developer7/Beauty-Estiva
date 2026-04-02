/**
 * @module Pagination
 * Stateless pagination utilities for list endpoints.
 *
 * Usage (route handler):
 *   const page = Pagination.parse(searchParams);
 *   const [items, total] = await Promise.all([
 *     prisma.model.findMany({ ...page.prisma }),
 *     prisma.model.count({ where }),
 *   ]);
 *   return Response.ok(Pagination.build(items, total, page));
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Parsed pagination parameters ready for use in Prisma queries. */
export interface PageOptions {
  /** 1-based page number. */
  page: number;
  /** Number of items per page (capped at MAX_PAGE_SIZE). */
  pageSize: number;
  /** Prisma `skip` value — derived from page and pageSize. */
  skip: number;
  /** Prisma query fragment: { skip, take }. */
  prisma: { skip: number; take: number };
}

/** Paginated response envelope returned to the client. */
export interface PageResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ─── Pagination class ─────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE = 1;

export class Pagination {
  /**
   * Parse pagination params from a request's URLSearchParams.
   * Accepts `page` / `pageNumber` and `pageSize`.
   * Invalid or out-of-range values are clamped to safe defaults.
   */
  static parse(searchParams: URLSearchParams): PageOptions {
    const raw = {
      page: searchParams.get("page") ?? searchParams.get("pageNumber") ?? "1",
      pageSize: searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    };

    const page = Math.max(MIN_PAGE, Number.parseInt(raw.page, 10) || 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.parseInt(raw.pageSize, 10) || DEFAULT_PAGE_SIZE),
    );
    const skip = (page - 1) * pageSize;

    return { page, pageSize, skip, prisma: { skip, take: pageSize } };
  }

  /**
   * Build the paginated response envelope from a list of items and the total
   * row count. The caller is responsible for fetching both values.
   */
  static build<T>(
    items: T[],
    totalCount: number,
    options: Pick<PageOptions, "page" | "pageSize">,
  ): PageResult<T> {
    const { page, pageSize } = options;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return {
      items,
      totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Return true if the request explicitly requests pagination
   * (i.e. `page` or `pageSize` param is present).
   * Useful for endpoints that return a flat array for dropdowns
   * but paginated results for tables.
   */
  static isRequested(searchParams: URLSearchParams): boolean {
    return (
      searchParams.has("page") ||
      searchParams.has("pageNumber") ||
      searchParams.has("pageSize")
    );
  }
}
