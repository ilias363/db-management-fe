"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/common/loading-screen";
import { getIsSystemAdmin } from "@/lib/actions/auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const adminStatus = await getIsSystemAdmin();
        if (adminStatus === null || adminStatus === false) {
          toast.error("Admin access required", { id: "admin-access-error" });
          router.push("/");
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        console.error("Failed to check admin status:", error);
        toast.error("Failed to verify admin access", { id: "admin-access-error" });
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isLoading || !isAdmin) {
    return <LoadingScreen message="Checking admin access..." />;
  }

  return <>{children}</>;
}
