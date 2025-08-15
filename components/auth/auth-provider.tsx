"use client";

import { useEffect } from "react";
import { AuthProvider as AuthContextProvider, useAuth } from "@/lib/auth";
import { LoadingScreen } from "@/components/common";
import { usePathname, useRouter } from "next/navigation";

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthWrapper({ children }: AuthProviderProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      const callbackUrl = pathname !== "/" ? `?callbackUrl=${encodeURIComponent(pathname)}` : "";
      router.push(`/login${callbackUrl}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return <LoadingScreen message="Loading user data..." />;
  }

  if (!user) {
    return <LoadingScreen message="Redirecting to login..." />;
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <AuthContextProvider>
      <AuthWrapper>{children}</AuthWrapper>
    </AuthContextProvider>
  );
}
