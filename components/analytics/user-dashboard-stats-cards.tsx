"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDashboardStats } from "@/lib/hooks";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Target,
  Database,
  Table,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

export function UserDashboardStatsCards() {
  const { data: stats, isLoading, error } = useUserDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[60px]" />
              <Skeleton className="h-3 w-[120px] mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Failed to load dashboard statistics
          </div>
        </CardContent>
      </Card>
    );
  }

  const statsCards: StatsCardProps[] = [
    {
      title: "Total Actions",
      value: stats.totalActions.toLocaleString(),
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
      description: "All time activity",
    },
    {
      title: "Success Rate",
      value: `${stats.successRate.toFixed(1)}%`,
      icon: <Target className="h-4 w-4 text-green-600" />,
      description: `${stats.totalSuccessfulActions.toLocaleString()} successful actions`,
    },
    {
      title: "Failed Actions",
      value: stats.totalFailedActions.toLocaleString(),
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      description: "Actions that failed",
    },
    {
      title: "Most Used Action",
      value: stats.mostUsedAction,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      description: "Your primary action type",
    },
    {
      title: "Last 24 Hours",
      value: stats.last24HoursActions.toLocaleString(),
      icon: <Clock className="h-4 w-4 text-blue-600" />,
      description: "Recent activity",
    },
    {
      title: "Last 7 Days",
      value: stats.last7DaysActions.toLocaleString(),
      icon: <Calendar className="h-4 w-4 text-purple-600" />,
      description: "Weekly activity",
    },
    {
      title: "Schemas Accessed",
      value: stats.uniqueSchemasAccessed.toLocaleString(),
      icon: <Database className="h-4 w-4 text-orange-600" />,
      description: `Most accessed: ${stats.mostAccessedSchema}`,
    },
    {
      title: "Tables Accessed",
      value: stats.uniqueTablesAccessed.toLocaleString(),
      icon: <Table className="h-4 w-4 text-indigo-600" />,
      description: `Most accessed: ${stats.mostAccessedTable}`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
}
