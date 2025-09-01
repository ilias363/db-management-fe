"use client";

import { useCallback } from "react";
import { AuthProvider as AuthContextProvider, useAuth } from "@/lib/auth";
import { LoadingScreen } from "@/components/common";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthWrapper({ children }: AuthProviderProps) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  if (isLoading) return <LoadingScreen message="Loading user data..." />;

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight">No active session</h1>
          <p className="text-muted-foreground text-sm">
            We couldn&apos;t find a logged in user. This can happen if your session expired or was
            cleared. You can try reloading the page.
            {pathname !== "/login" &&
              " If the issue persists, go to the login page and sign in again."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleReload}>Reload</Button>
          {pathname !== "/login" && (
            <Button variant="outline" onClick={() => (window.location.href = "/login")}>
              Go to Login
            </Button>
          )}
        </div>
      </div>
    );
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
