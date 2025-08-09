"use client";

import { StatsCard } from "@/components/common/stats-card";
import { useDatabaseStats } from "@/lib/hooks";
import { Database, FileText, Table, View } from "lucide-react";
import { toast } from "sonner";

interface DatabaseStatsCardsProps {
  includeSystem?: boolean;
}

export function DatabaseStatsCards({ includeSystem = true }: DatabaseStatsCardsProps) {
  const { data: stats, isFetching, error } = useDatabaseStats(includeSystem);

  if (error && !stats) {
    toast.error("Failed to load database stats.", {
      description: error?.message || "An unexpected error occurred.",
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Schemas"
        value={stats?.totalSchemas}
        description="Total schemas in the database"
        icon={Database}
        iconColor="text-blue-500"
        isLoading={isFetching}
        error={error && !stats ? error : null}
      />

      <StatsCard
        title="Tables"
        value={stats?.totalTables}
        description="Across all schemas"
        icon={Table}
        iconColor="text-green-500"
        isLoading={isFetching}
        error={error && !stats ? error : null}
      />

      <StatsCard
        title="Total Views"
        value={stats?.totalViews}
        description="Across all schemas"
        icon={View}
        iconColor="text-purple-500"
        isLoading={isFetching}
        error={error && !stats ? error : null}
      />

      <StatsCard
        title="Total Records"
        value={stats?.totalRecords.toLocaleString()}
        description="Total records across all tables"
        icon={FileText}
        iconColor="text-orange-500"
        isLoading={isFetching}
        error={error && !stats ? error : null}
      />
    </div>
  );
}
