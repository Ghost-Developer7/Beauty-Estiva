import api from "@/lib/api";
import type {
  ApiResponse,
  LoginRequest,
  LoginResult,
  StaffRegisterRequest,
} from "@/types/api";

export const authService = {
  login(data: LoginRequest) {
    return api.post<ApiResponse<LoginResult>>("/auth/login", data);
  },

  registerStaff(data: StaffRegisterRequest) {
    return api.post<ApiResponse<number>>("/auth/register", data);
  },
};
