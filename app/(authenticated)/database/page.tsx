import { DatabaseStatsCards } from "@/components/database/database-stats-cards";
import { LastUpdated } from "@/components/common/last-updated";
import { PermissionAccessInfoCard } from "@/components/database/permission-access-info-card";
import { DatabaseQuickActions } from "@/components/database/database-quick-actions";

export default function DatabasePage() {
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
        <LastUpdated />
      </div>

      <PermissionAccessInfoCard />

      <DatabaseStatsCards
        stats={{
          totalSchemas: 6,
          totalTables: 57,
          totalViews: 23,
          totalRecords: 91237,
        }}
      />

      <DatabaseQuickActions />
    </div>
  );
}
