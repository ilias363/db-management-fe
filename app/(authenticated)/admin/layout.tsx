"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/common/loading-screen";
import { useAuth } from "@/lib/auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait for auth to be loaded
      if (authLoading) return;

      if (!user) {
        toast.error("Authentication required", { id: "admin-access-error" });
        router.push("/login");
        return;
      }

      try {
        // Check admin status via API
        const response = await fetch("/api/auth/is-system-admin", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.isSystemAdmin) {
            setIsAdmin(true);
          } else {
            toast.error("Admin access required", { id: "admin-access-error" });
            router.push("/");
          }
        } else {
          toast.error("Failed to verify admin access", { id: "admin-access-error" });
          router.push("/");
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        toast.error("Failed to verify admin access", { id: "admin-access-error" });
        router.push("/");
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [router, user, authLoading]);

  if (authLoading || isChecking) {
    return <LoadingScreen message="Checking admin access..." />;
  }

  if (!isAdmin) {
    return <LoadingScreen message="Redirecting..." />;
  }

  return <>{children}</>;
}
