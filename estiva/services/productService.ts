import api from "@/lib/api";
import type {
  ApiResponse,
  ProductCreate,
  ProductUpdate,
  ProductListItem,
  ProductSaleCreate,
  ProductSaleListItem,
} from "@/types/api";

export const productService = {
  // Products
  list() {
    return api.get<ApiResponse<ProductListItem[]>>("/product");
  },

  getById(id: number) {
    return api.get<ApiResponse<ProductListItem>>(`/product/${id}`);
  },

  create(data: ProductCreate) {
    return api.post<ApiResponse<{ id: number }>>("/product", data);
  },

  update(id: number, data: ProductUpdate) {
    return api.put<ApiResponse<boolean>>(`/product/${id}`, data);
  },

  delete(id: number) {
    return api.delete<ApiResponse<boolean>>(`/product/${id}`);
  },

  // Product Sales
  listSales(params?: { startDate?: string; endDate?: string; staffId?: number; customerId?: number }) {
    return api.get<ApiResponse<ProductSaleListItem[]>>("/product/sales", { params });
  },

  getSaleById(id: number) {
    return api.get<ApiResponse<ProductSaleListItem>>(`/product/sales/${id}`);
  },

  createSale(data: ProductSaleCreate) {
    return api.post<ApiResponse<{ id: number }>>("/product/sales", data);
  },

  deleteSale(id: number) {
    return api.delete<ApiResponse<boolean>>(`/product/sales/${id}`);
  },
};
