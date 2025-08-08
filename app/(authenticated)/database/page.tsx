"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Table, View, Shield } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/stores/auth-store";
import { DatabaseStatsCards } from "@/components/database/database-stats-cards";

const QUICK_ACTIONS = [
  {
    title: "Manage Schemas",
    description: "Create, modify, and organize database schemas",
    icon: Database,
    href: "/database/schemas",
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  {
    title: "Manage Tables",
    description: "Design, alter, and maintain database tables",
    icon: Table,
    href: "/database/tables",
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    title: "Manage Views",
    description: "Manage and maintain database views",
    icon: View,
    href: "/database/views",
    color: "text-orange-500",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
  },
];

export default function DatabasePage() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(role => role.name === "ADMIN");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Welcome to Database Management</h2>
        <p className="text-muted-foreground">
          Manage your database schemas, tables, views, and data with permission-based access
          control.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-800 dark:text-amber-200">
              Permission-Based Access
            </CardTitle>
          </div>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            Your access to database operations is controlled by your assigned permissions. You can
            only view and modify databases, schemas, tables, and data that you have explicit
            permissions for.
            {isAdmin && " As an admin, you have elevated access to system functions."}
          </CardDescription>
        </CardHeader>
      </Card>

      <DatabaseStatsCards
        stats={{
          totalSchemas: 6,
          totalTables: 57,
          totalViews: 23,
          totalRecords: 91237,
        }}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map(action => (
            <Card
              key={action.title}
              className="hover:shadow-md dark:shadow-slate-900 transition-shadow flex justify-between"
            >
              <CardHeader className="pb-3">
                <div
                  className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center mb-2`}
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription className="text-sm">{action.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button asChild variant="outline" className="w-full">
                  <Link href={action.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
