"use client";

import AdminDashboard from "@/components/layout/admin-dashboard";
import UserDashboard from "@/components/layout/user-dashboard";
import { LoadingScreen } from "@/components/common/loading-screen";
import { useIsSystemAdmin } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/auth";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsSystemAdmin({ enabled: !!user });

  const isLoading = authLoading || adminCheckLoading;

  if (isLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}
