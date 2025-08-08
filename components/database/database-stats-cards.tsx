import { StatsCard } from "@/components/common/stats-card";
import { DatabaseStats } from "@/lib/types/database";
import { Database, FileText, Table, View } from "lucide-react";

interface DatabaseStatsCardsProps {
  stats: DatabaseStats;
}

export function DatabaseStatsCards({ stats }: DatabaseStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Schemas"
        value={stats.totalSchemas}
        description="Total schemas in the database"
        icon={Database}
        iconColor="text-blue-500"
      />

      <StatsCard
        title="Tables"
        value={stats.totalTables}
        description="Across all schemas"
        icon={Table}
        iconColor="text-green-500"
      />

      <StatsCard
        title="Total Views"
        value={stats.totalViews}
        description="Across all schemas"
        icon={View}
        iconColor="text-purple-500"
      />

      <StatsCard
        title="Total Records"
        value={stats.totalRecords.toLocaleString()}
        description="Total records across all tables"
        icon={FileText}
        iconColor="text-orange-500"
      />
    </div>
  );
}
