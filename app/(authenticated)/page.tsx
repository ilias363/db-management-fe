"use client";

import { useEffect } from "react";
import AdminDashboard from "@/components/layout/admin-dashboard";
import UserDashboard from "@/components/layout/user-dashboard";
import { LoadingScreen } from "@/components/common/loading-screen";
import { useIsSystemAdmin } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/auth";
import { analyticsQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default function Dashboard() {
  const queryClient = getQueryClient();

  const { user, isLoading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsSystemAdmin({ enabled: !!user });

  const isLoading = authLoading || adminCheckLoading;

  useEffect(() => {
    if (isAdmin === true) {
      queryClient.prefetchQuery(analyticsQueries.dashboardStats(true));
    } else if (!isLoading && isAdmin === false) {
      queryClient.prefetchQuery(analyticsQueries.userDashboardStats());
    }
  }, [isAdmin, isLoading, queryClient]);

  if (isLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </HydrationBoundary>
  );
}
