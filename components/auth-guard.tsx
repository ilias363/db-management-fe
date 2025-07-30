"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/stores/auth-store";
import { apiClient } from "@/lib/api-client";

interface AuthGuardProps {
  children: React.ReactNode;
}

const publicRoutes = ["/login"];

const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isInitialized, initializeAuth, clearUser } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  const isPublicRoute = useMemo(() => publicRoutes.includes(pathname), [pathname]);

  useEffect(() => {
    if (isInitialized || isInitializing) return;

    setIsInitializing(true);

    initializeAuth().finally(() => {
      setIsInitializing(false);
    });
  }, [isInitialized, initializeAuth, isInitializing]);

  useEffect(() => {
    setHasRedirected(false);
    apiClient.auth
      .isLoggedIn()
      .then(resp => {
        if (resp.success && resp.data?.isLoggedIn) {
          return;
        }
        clearUser();
      })
      .catch(err => console.log(err));
  }, [pathname, clearUser]);

  useEffect(() => {
    if (isLoading || isInitializing || !isInitialized || hasRedirected) {
      return;
    }

    if (!user && !isPublicRoute) {
      setHasRedirected(true);
      router.replace("/login");
      return;
    }

    if (user && pathname === "/login") {
      setHasRedirected(true);
      router.replace("/");
      return;
    }
  }, [user, isLoading, isInitialized, isPublicRoute, router, pathname, isInitializing, hasRedirected]);
  if (!isInitialized || isInitializing) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!user && !isPublicRoute) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  if (user && pathname === "/login") {
    return <LoadingScreen message="Redirecting to dashboard..." />;
  }

  return <>{children}</>;
}
