import { StatsCard } from "@/components/common";
import { AuditStats } from "@/lib/types";
import { FileText, AlertTriangle, Activity, Clock } from "lucide-react";

interface AuditStatsCardsProps {
  stats: AuditStats;
}

export function AuditStatsCards({ stats }: AuditStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Total Audits"
        value={stats.totalAudits}
        description="All audit logs"
        icon={FileText}
      />

      <StatsCard
        title="Failed Actions"
        value={stats.totalFailed}
        description={`${stats.failedPercentage.toFixed(1)}% failure rate`}
        icon={AlertTriangle}
        iconColor="text-red-500"
      />

      <StatsCard
        title="Recent Activity"
        value={stats.last24hActivityCount}
        description="Last 24 hours"
        icon={Activity}
        iconColor="text-blue-500"
      />

      <StatsCard
        title="Avg Actions/Day"
        value={Math.round(stats.averageActionsPerDay)}
        description="Daily average"
        icon={Clock}
        iconColor="text-green-500"
      />
    </div>
  );
}
