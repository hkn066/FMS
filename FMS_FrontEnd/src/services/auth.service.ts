import apiClient from "@/lib/api-client";
import type { ApiResponse, TokenResponse, UserProfileResponse } from "@/types/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await apiClient.post<ApiResponse<TokenResponse>>("/auth/login", payload);
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Giriş başarısız");
    }
    return data.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore — token may already be invalid
    }
  },

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const { data } = await apiClient.post<ApiResponse<TokenResponse>>("/auth/refresh", {
      refreshToken,
    });
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Token yenilenemedi");
    }
    return data.data;
  },

  async getProfile(): Promise<UserProfileResponse> {
    const { data } = await apiClient.get<ApiResponse<UserProfileResponse>>("/users/me");
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Profil alınamadı");
    }
    return data.data;
  },
};
