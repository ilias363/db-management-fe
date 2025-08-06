"use client";

import AdminDashboard from "@/components/layout/admin-dashboard";
import UserDashboard from "@/components/layout/user-dashboard";
import { useAuth } from "@/lib/stores/auth-store";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(role => role.name === "ADMIN");

  if (isAdmin) {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  }
}
