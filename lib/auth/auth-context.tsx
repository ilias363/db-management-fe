"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/hooks";
import { logoutAction } from "@/lib/auth";
import type { UserDto } from "@/lib/types";

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading, refetch } = useCurrentUser();

  const refresh = async () => {
    await refetch();
  };

  const login = () => {
    refetch();
  };

  const logout = async () => {
    try {
      queryClient.clear();
      await logoutAction();
    } catch (error) {
      console.error("Logout failed:", error);
      queryClient.clear();
      router.push("/login");
    }
  };

  const value: AuthContextType = {
    user: user ?? null,
    isLoading,
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
