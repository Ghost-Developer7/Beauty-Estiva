import api from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  ExpenseCategoryCreate,
  ExpenseCategoryItem,
  ExpenseCreate,
  ExpenseUpdate,
  ExpenseItem,
} from "@/types/api";

export const expenseService = {
  // ─── Categories ───
  listCategories() {
    return api.get<ApiResponse<ExpenseCategoryItem[]>>("/expense/category");
  },

  getCategoryById(id: number) {
    return api.get<ApiResponse<ExpenseCategoryItem>>(
      `/expense/category/${id}`,
    );
  },

  createCategory(data: ExpenseCategoryCreate) {
    return api.post<ApiResponse<number>>("/expense/category", data);
  },

  updateCategory(id: number, data: ExpenseCategoryCreate) {
    return api.put<ApiResponse<null>>(`/expense/category/${id}`, data);
  },

  deleteCategory(id: number) {
    return api.delete<ApiResponse<null>>(`/expense/category/${id}`);
  },

  // ─── Expenses ───
  list(params?: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
  }) {
    return api.get<ApiResponse<ExpenseItem[]>>("/expense", { params });
  },

  listPaginated(params?: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
    pageNumber?: number;
    pageSize?: number;
  }) {
    return api.get<ApiResponse<PaginatedResponse<ExpenseItem>>>("/expense", { params });
  },

  getById(id: number) {
    return api.get<ApiResponse<ExpenseItem>>(`/expense/${id}`);
  },

  create(data: ExpenseCreate) {
    return api.post<ApiResponse<number>>("/expense", data);
  },

  update(id: number, data: ExpenseUpdate) {
    return api.put<ApiResponse<null>>(`/expense/${id}`, data);
  },

  delete(id: number) {
    return api.delete<ApiResponse<null>>(`/expense/${id}`);
  },
};
