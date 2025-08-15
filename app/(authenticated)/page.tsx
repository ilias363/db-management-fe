import AdminDashboard from "@/components/layout/admin-dashboard";
import UserDashboard from "@/components/layout/user-dashboard";
import { getIsSystemAdmin } from "@/lib/auth";

export default async function Dashboard() {
  let isAdmin;
  try {
    isAdmin = await getIsSystemAdmin();
  } catch {
    isAdmin = false;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  }
}
