import { StatsCard } from "@/components/stats-card";
import { Shield } from "lucide-react";
import type { RoleStats } from "@/lib/types";

interface RoleStatsCardsProps {
  stats: RoleStats;
}

export function RoleStatsCards({ stats }: RoleStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Total Roles"
        value={stats.totalRoles}
        description="System & custom"
        icon={Shield}
      />

      <StatsCard
        title="System Roles"
        value={stats.systemRoles}
        description="Built-in roles"
        icon={Shield}
        iconColor="text-blue-500"
      />

      <StatsCard
        title="Custom Roles"
        value={stats.customRoles}
        description="User-defined"
        icon={Shield}
        iconColor="text-green-500"
      />

      <StatsCard
        title="Total role assignments"
        value={stats.roleAssignments}
        description="User role assignments"
        icon={Shield}
        iconColor="text-orange-500"
      />
    </div>
  );
}
