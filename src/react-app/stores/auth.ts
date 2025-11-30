import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  provinceScope?: string;
  districtScope?: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Invalid credentials");
          }

          const data = await res.json();
          set({
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Login failed";
          set({ error: message, isLoading: false });
          return false;
        }
      },

      register: async (data: RegisterData): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!res.ok) {
            const responseData = await res.json();
            throw new Error(responseData.error || "Registration failed");
          }

          const responseData = await res.json();
          set({
            user: responseData.user,
            token: responseData.token,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Registration failed";
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
      },

      refreshUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const res = await fetch("/api/v1/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            // Token invalid or expired, clear auth state
            set({ user: null, token: null });
            return;
          }

          const user = await res.json();
          set({ user });
        } catch {
          // Network error, keep current state
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
