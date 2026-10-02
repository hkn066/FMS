"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TokenResponse } from "@/types/api";
import { mapRoleToLabel } from "@/lib/mappers";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  roles: string[];
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (response: TokenResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

function toAuthUser(user: TokenResponse["user"]): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    role: mapRoleToLabel(user.roles),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (response) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", response.accessToken);
          localStorage.setItem("refresh_token", response.refreshToken);
        }
        set({
          user: toAuthUser(response.user),
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", accessToken);
          localStorage.setItem("refresh_token", refreshToken);
        }
        set({ accessToken, refreshToken });
      },

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("refresh_token");
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "fms-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
