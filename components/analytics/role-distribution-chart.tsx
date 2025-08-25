"use client";

import { useRoleDistribution } from "@/lib/hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#ec4899",
  "#6366f1",
];

export function RoleDistributionChart() {
  const { data, isLoading, error } = useRoleDistribution();

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-300">Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 dark:text-red-400">
            Failed to load role distribution data
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData =
    data
      ?.filter(item => item.userCount > 0)
      .map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
      })) || [];

  const renderTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { roleName: string; userCount: number } }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.roleName}</p>
          <p className="text-sm text-muted-foreground">Assigned to {data.userCount} Users</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Skeleton className="h-64 w-64 rounded-full" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-muted-foreground">
            No role distribution data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ roleName, userCount }) => `${roleName}: ${userCount}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="userCount"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {!isLoading && chartData.length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {chartData.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate">
                  {item.roleName}: {item.userCount}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
