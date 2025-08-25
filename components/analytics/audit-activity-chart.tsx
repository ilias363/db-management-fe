"use client";

import { useAuditActivity } from "@/lib/hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AnalyticsTimeRange } from "@/lib/types";

interface AuditActivityChartProps {
  timeRange: AnalyticsTimeRange;
}

export function AuditActivityChart({ timeRange }: AuditActivityChartProps) {
  const { data, isLoading, error } = useAuditActivity(timeRange);

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-300">Audit Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 dark:text-red-400">
            Failed to load audit activity data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs text-muted-foreground"
                tickFormatter={value => new Date(value).toLocaleDateString()}
              />
              <YAxis className="text-xs text-muted-foreground" />
              <Tooltip
                labelFormatter={value => `Date: ${new Date(value).toLocaleDateString()}`}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Bar
                dataKey="totalActions"
                fill="#3b82f6"
                name="Total Actions"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="successfulActions"
                fill="#10b981"
                name="Successful"
                radius={[2, 2, 0, 0]}
              />
              <Bar dataKey="failedActions" fill="#ef4444" name="Failed" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
