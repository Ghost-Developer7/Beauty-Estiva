export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function paginatedResponse<T>(
  items: T[],
  totalCount: number,
  pageNumber: number,
  pageSize: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalCount / pageSize);
  return {
    items,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    hasNextPage: pageNumber < totalPages,
    hasPreviousPage: pageNumber > 1,
  };
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || searchParams.get("pageNumber") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}
