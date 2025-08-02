"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/stores/auth-store";
import { LoadingScreen } from "./loading-screen";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth, isInitialized, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  if (isLoading) {
    return <LoadingScreen message="Refreshing user authentication..." />;
  }

  if (isInitialized && !user) {
    toast.error("An error occurred while fetching user data. Please log in again.");

    router.push("/login");
    return null;
  }

  return <>{children}</>;
}
