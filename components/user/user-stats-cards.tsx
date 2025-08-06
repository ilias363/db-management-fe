import { StatsCard } from "@/components/common/stats-card";
import { UserStats } from "@/lib/types";
import { Users } from "lucide-react";

interface UserStatsCardsProps {
  stats: UserStats;
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Total Users"
        value={stats.totalUsers}
        description="System users"
        icon={Users}
      />

      <StatsCard
        title="Active Users"
        value={stats.activeUsers}
        description="Currently active"
        icon={Users}
        iconColor="text-green-500"
      />

      <StatsCard
        title="Admin Users"
        value={stats.adminUsers}
        description="With admin role"
        icon={Users}
        iconColor="text-orange-500"
      />

      <StatsCard
        title="New This Month"
        value={stats.newThisMonth}
        description="Recent additions"
        icon={Users}
        iconColor="text-blue-500"
      />
    </div>
  );
}
