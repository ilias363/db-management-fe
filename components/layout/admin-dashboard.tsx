"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DashboardStatsCards,
  UserActivityChart,
  RoleDistributionChart,
  AuditActivityChart,
  AuditHeatmap,
  TopUsersTable,
  DatabaseUsageTable,
  DateRangePicker,
} from "@/components/analytics";
import { useAnalyticsTimeRange } from "@/lib/hooks/use-analytics";
import { BarChart3, Users, Database, Shield } from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
  const [includeSystem, setIncludeSystem] = useState(true);

  const usersTimeRange = useAnalyticsTimeRange();
  const auditTimeRange = useAnalyticsTimeRange();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for your database management system
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="include-system"
              checked={includeSystem}
              onCheckedChange={setIncludeSystem}
            />
            <Label htmlFor="include-system" className="text-sm">
              Include System Data
            </Label>
          </div>
        </div>
      </div>

      <section>
        <DashboardStatsCards includeSystem={includeSystem} />
      </section>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <DateRangePicker
            timeRange={usersTimeRange.timeRange}
            onTimeRangeChange={usersTimeRange.setTimeRange}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <UserActivityChart timeRange={usersTimeRange.timeRange} />
            <RoleDistributionChart />
          </div>
          <TopUsersTable timeRange={usersTimeRange.timeRange} />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseUsageTable includeSystem={includeSystem} />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <DateRangePicker
            timeRange={auditTimeRange.timeRange}
            onTimeRangeChange={auditTimeRange.setTimeRange}
          />
          <AuditActivityChart timeRange={auditTimeRange.timeRange} />
          <AuditHeatmap />
        </TabsContent>
      </Tabs>
    </div>
  );
}
