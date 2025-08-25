"use client";

import { useDashboardStats } from "@/lib/hooks/use-analytics";
import { StatsCard } from "@/components/common/stats-card";
import { Users, Shield, Activity, Database, Table, Eye, HardDrive, TrendingUp } from "lucide-react";

interface DashboardStatsCardsProps {
  includeSystem?: boolean;
}

export function DashboardStatsCards({ includeSystem = true }: DashboardStatsCardsProps) {
  const { data: stats, isLoading, error } = useDashboardStats(includeSystem);

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers,
      description: `Registered users in the system (${stats?.totalActiveUsers} active)`,
      icon: Users,
      iconColor: "text-blue-500",
    },
    {
      title: "Total Roles",
      value: stats?.totalRoles,
      description: "Defined user roles",
      icon: Shield,
      iconColor: "text-purple-500",
    },
    {
      title: "Total Audits",
      value: stats?.totalAudits,
      description: "Audit log entries",
      icon: Activity,
      iconColor: "text-red-500",
    },
    {
      title: "7-Day Activity",
      value: stats?.last7DaysActivity,
      description: "Actions in the last 7 days",
      icon: TrendingUp,
      iconColor: "text-orange-500",
    },
    {
      title: "Database Schemas",
      value: stats?.totalSchemas,
      description: "Total database schemas",
      icon: Database,
      iconColor: "text-indigo-500",
    },
    {
      title: "Database Tables",
      value: stats?.totalTables,
      description: "Total database tables",
      icon: Table,
      iconColor: "text-teal-500",
    },
    {
      title: "Database Views",
      value: stats?.totalViews,
      description: "Total database views",
      icon: Eye,
      iconColor: "text-cyan-500",
    },
    {
      title: "Total Records",
      value: stats?.totalRecords?.toLocaleString(),
      description: "Records across all tables",
      icon: HardDrive,
      iconColor: "text-yellow-500",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-4">
      {statsCards.map((card, index) => (
        <StatsCard
          key={index}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
          iconColor={card.iconColor}
          isLoading={isLoading}
          error={error}
        />
      ))}
    </div>
  );
}
