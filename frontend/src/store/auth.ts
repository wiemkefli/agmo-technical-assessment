"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiRequest, getErrorMessage } from "@/lib/api";
import type { Role, User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  role: Role | null;
  loading: boolean;
  hydrated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: Role;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      loading: false,
      hydrated: false,
      error: null,

      clearError: () => set({ error: null }),
      setHydrated: (hydrated) => set({ hydrated }),

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await apiRequest<{ data: User; token: string }>("auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          set({ user: res.data, token: res.token, role: res.data.role });
        } catch (e: unknown) {
          const message = getErrorMessage(e, "Login failed");
          set({ error: message });
          throw e;
        } finally {
          set({ loading: false });
        }
      },

      register: async (payload) => {
        set({ loading: true, error: null });
        try {
          const res = await apiRequest<{ data: User; token: string }>("auth/register", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          set({ user: res.data, token: res.token, role: res.data.role });
        } catch (e: unknown) {
          const message = getErrorMessage(e, "Register failed");
          set({ error: message });
          throw e;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        const token = get().token;
        set({ loading: true, error: null });
        try {
          if (token) {
            await apiRequest("auth/logout", {
              method: "POST",
              token,
            });
          }
        } finally {
          set({ user: null, token: null, role: null, loading: false });
        }
      },

      fetchMe: async () => {
        const token = get().token;
        if (!token) return;
        set({ loading: true });
        try {
          const res = await apiRequest<{ data: User }>("auth/me", { token });
          set({ user: res.data, role: res.data.role });
        } catch {
          set({ user: null, token: null, role: null });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "mini-job-board-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user, role: state.role }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
