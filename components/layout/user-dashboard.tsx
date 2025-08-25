"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Database, Shield, Clock } from "lucide-react";
import {
  UserDashboardStatsCards,
  UserActionBreakdownChart,
  UserRecentActivityTable,
  UserDatabaseAccessTable,
  AuditHeatmap,
} from "@/components/analytics";

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your personal activity overview and database access summary
          </p>
        </div>
      </div>

      <section>
        <UserDashboardStatsCards />
      </section>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Access
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Actions
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <UserActionBreakdownChart />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <UserDatabaseAccessTable />
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <UserRecentActivityTable />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <AuditHeatmap userSpecific={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
