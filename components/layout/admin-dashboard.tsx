"use client";

import {
  Activity,
  BarChart3,
  CheckCircle,
  CircleX,
  Database,
  Plus,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LastUpdated } from "@/components/common";

// Mock data
const mockAdminData = {
  admin: {
    name: "John Doe",
    role: "System Administrator",
  },
  systemStats: {
    totalUsers: 247,
    activeUsers: 180,
    userGrowth: 12,
    totalRoles: 25,
    customRoles: 23,
    roleGrowth: 5,
    totalDatabaseObjects: 342,
    totalAcitivityLogs: 2156,
    logsGrowth: 8,
  },
  recentActivities: [
    {
      action: "User created",
      user: "john.doe@company.com",
      time: "2 minutes ago",
      type: "success",
    },
    {
      action: "Role permissions updated",
      user: "admin",
      time: "15 minutes ago",
      type: "failure",
    },
    {
      action: "Database backup completed",
      user: "system",
      time: "1 hour ago",
      type: "success",
    },
    {
      action: "Failed login attempt",
      user: "unknown",
      time: "2 hours ago",
      type: "failure",
    },
  ],
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {mockAdminData.admin.name}
          </h1>
          <p className="text-muted-foreground">System overview and management controls</p>
        </div>
        <LastUpdated />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAdminData.systemStats.totalUsers}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {mockAdminData.systemStats.activeUsers} active users
              </p>
              <div className="flex items-center text-xs text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                {mockAdminData.systemStats.userGrowth} %
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAdminData.systemStats.totalRoles}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {mockAdminData.systemStats.customRoles} custom role
              </p>
              <div className="flex items-center text-xs text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                {mockAdminData.systemStats.roleGrowth} %
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAdminData.systemStats.totalAcitivityLogs}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Last week</p>
              <div className="flex items-center text-xs text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                {mockAdminData.systemStats.logsGrowth} %
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Objects</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAdminData.systemStats.totalDatabaseObjects}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Tables and views</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent System Activity
            </CardTitle>
            <CardDescription>Latest administrative actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockAdminData.recentActivities.map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  {activity.type === "success" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {activity.type === "failure" && <CircleX className="h-4 w-4 text-red-500" />}
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">by {activity.user}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              Create New User
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Shield className="h-4 w-4" />
              Manage Roles
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Database className="h-4 w-4" />
              Database Management
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <BarChart3 className="h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
