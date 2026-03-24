import api from "@/lib/api";
import type {
  ApiResponse,
  ProfileData,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types/api";

export const profileService = {
  getProfile() {
    return api.get<ApiResponse<ProfileData>>("/profile");
  },

  updateProfile(data: UpdateProfileRequest) {
    return api.put<ApiResponse<ProfileData>>("/profile", data);
  },

  changePassword(data: ChangePasswordRequest) {
    return api.put<ApiResponse<object>>("/profile/password", data);
  },

  uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiResponse<string>>("/profile/picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  removeProfilePicture() {
    return api.delete<ApiResponse<object>>("/profile/picture");
  },
};
