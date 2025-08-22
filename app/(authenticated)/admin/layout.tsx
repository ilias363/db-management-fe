"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/common/loading-screen";
import { useAuth } from "@/lib/auth";
import { useIsSystemAdmin } from "@/lib/hooks/use-auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const {
    data: isAdmin,
    isLoading: adminCheckLoading,
    error: adminCheckError,
  } = useIsSystemAdmin({ enabled: !!user });

  const isChecking = authLoading || adminCheckLoading;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("Authentication required", { id: "admin-access-error" });
      router.push("/login");
      return;
    }

    if (adminCheckLoading) return;

    if (adminCheckError) {
      console.error("Failed to check admin status:", adminCheckError);
      toast.error("Failed to verify admin access", { id: "admin-access-error" });
      router.push("/");
      return;
    }

    // Handle non-admin user
    if (isAdmin === false) {
      toast.error("Admin access required", { id: "admin-access-error" });
      router.push("/");
      return;
    }
  }, [router, user, authLoading, adminCheckLoading, adminCheckError, isAdmin]);

  if (isChecking) {
    return <LoadingScreen message="Checking admin access..." />;
  }

  if (!isAdmin) {
    return <LoadingScreen message="Redirecting..." />;
  }

  return <>{children}</>;
}
