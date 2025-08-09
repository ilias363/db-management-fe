"use client";

import { DatabaseStatsCards } from "@/components/database/database-stats-cards";
import { PermissionAccessInfoCard } from "@/components/database/permission-access-info-card";
import { DatabaseQuickActions } from "@/components/database/database-quick-actions";
import { LastUpdated } from "../common/last-updated";
import { useDatabaseStats } from "@/lib/hooks";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function DatabasePageContent() {
  const [includeSystem, setIncludeSystem] = useState(true);
  const { refetch, isFetching } = useDatabaseStats(includeSystem);

  const handleRefresh = async () => {
    await refetch();
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Database Management</h1>
          <p className="text-muted-foreground">
            Manage your database schemas, tables, views, and data with permission-based access
            control.
          </p>
        </div>
        <LastUpdated onRefresh={handleRefresh} resetTrigger={isFetching ? Date.now() : undefined} />
      </div>

      <PermissionAccessInfoCard />

      <div className="flex items-center space-x-2">
        <Switch checked={includeSystem} onCheckedChange={setIncludeSystem} />
        <Label htmlFor="include-system" className="text-sm font-medium">
          Include system schemas in stats
        </Label>
      </div>

      <DatabaseStatsCards includeSystem={includeSystem} />

      <DatabaseQuickActions />
    </div>
  );
}
