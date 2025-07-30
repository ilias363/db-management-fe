"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Activity, BarChart3, Clock, Shield } from "lucide-react";
import { LastUpdated } from "./last-updated";

// Mock data
const mockUserData = {
  user: {
    name: "John Doe",
    role: "Database Analyst",
  },
  stats: {
    accessibleDatabases: 5,
    writeAccessCount: 3,
    totalTables: 35,
    databaseSystem: "PostgreSQL",
    connectionStatus: "Connected",
  },
  recentActivities: [
    {
      action: "Viewed table structure",
      table: "customer_db.users",
      time: "5 minutes ago",
      result: "127 records",
    },
    {
      action: "Updated record in inventory_db",
      table: "products table",
      time: "1 hour ago",
      result: "1 record modified",
    },
    {
      action: "Browsed data in analytics_db",
      table: "sales_summary",
      time: "3 hours ago",
      result: "Viewed table data",
    },
  ],
  roles: [
    {
      name: "Database Viewer",
      description: "View access to database structures and data",
      permissions: 8,
      tables: ["customer_db.*", "analytics_db.*"],
      permissionTypes: ["READ"],
    },
    {
      name: "Data Editor",
      description: "Edit data in specific tables",
      permissions: 5,
      tables: ["customer_db.users", "inventory_db.products"],
      permissionTypes: ["READ", "WRITE"],
    },
    {
      name: "Inventory Manager",
      description: "Full access to inventory database",
      permissions: 12,
      tables: ["inventory_db.*"],
      permissionTypes: ["READ", "WRITE", "CREATE", "DELETE"],
    },
  ],
};

export default function UserDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {mockUserData.user.name}</h1>
          <p className="text-muted-foreground">Your database access and recent activity</p>
        </div>
        <LastUpdated />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessible Databases</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUserData.stats.accessibleDatabases}</div>
            <p className="text-xs text-muted-foreground">
              {mockUserData.stats.writeAccessCount} with write access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database System</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUserData.stats.databaseSystem}</div>
            <p className="text-xs text-muted-foreground">{mockUserData.stats.connectionStatus}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accessible Tables & Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUserData.stats.totalTables}</div>
            <p className="text-xs text-muted-foreground">Across all databases</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest database operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockUserData.recentActivities.map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded border">
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.table} • {activity.result}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Your Roles
            </CardTitle>
            <CardDescription>Roles assigned to you and their permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockUserData.roles.map((role, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{role.name}</h4>
                  <Badge variant="secondary">{role.permissions} permissions</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{role.description}</p>
                <div className="flex gap-1 flex-wrap">
                  {role.permissionTypes.map(permission => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Access: {role.tables.join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
