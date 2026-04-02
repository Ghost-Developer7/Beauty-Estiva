/**
 * @deprecated Import from "@/core/server" instead.
 *
 * This file is kept for backward compatibility.
 * All logic now lives in library/backend/Pagination.ts.
 */

import { Pagination, PageResult } from "@/core/server/Pagination";

// Re-export the old type name
export type PaginatedResponse<T> = PageResult<T>;

export const getPaginationParams = (searchParams: URLSearchParams) =>
  Pagination.parse(searchParams);

export const paginatedResponse = <T>(
  items: T[],
  totalCount: number,
  pageNumber: number,
  pageSize: number,
) => Pagination.build(items, totalCount, { page: pageNumber, pageSize });
