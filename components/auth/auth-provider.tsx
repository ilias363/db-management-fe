"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/stores/auth-store";
import { LoadingScreen } from "@/components/common";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth, isInitialized, user, hasAttemptedAuth, isLoading, refreshAuth } =
    useAuth();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitializing(true);
      initializeAuth().finally(() => setIsInitializing(false));
    } else if (!user && !hasAttemptedAuth) {
      refreshAuth();
    }
  }, [initializeAuth, isInitialized, user, hasAttemptedAuth, refreshAuth]);

  if (isInitializing || isLoading) {
    return <LoadingScreen message="Refreshing user authentication..." />;
  }

  if (isInitialized && !user && hasAttemptedAuth) {
    toast.error("An error occurred while fetching user data. Please log in again.");

    router.push("/login");
    return null;
  }

  if (user) {
    return <>{children}</>;
  }

  return <LoadingScreen message="Loading user data..." />;
}
