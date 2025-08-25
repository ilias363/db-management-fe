"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserActionBreakdown } from "@/lib/hooks";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
  "#8DD1E1",
  "#D084D0",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      actionType: string;
      actionCount: number;
      percentage: number;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg shadow-md p-3">
        <p className="font-medium">{data.actionType}</p>
        <p className="text-sm text-muted-foreground">Count: {data.actionCount.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">Percentage: {data.percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
}

export function UserActionBreakdownChart() {
  const { data: breakdown, isLoading, error } = useUserActionBreakdown();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Action Breakdown
          </CardTitle>
          <CardDescription>Distribution of your database actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-64 w-64 rounded-full" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !breakdown || breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Action Breakdown
          </CardTitle>
          <CardDescription>Distribution of your database actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              {error ? "Failed to load action breakdown" : "No actions recorded yet"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Take top 9 actions and group others
  const topActions = breakdown.slice(0, 9);
  const otherActions = breakdown.slice(9);

  let rawChartData: Array<{ actionType: string; actionCount: number; percentage: number }> =
    topActions;
  if (otherActions.length > 0) {
    const otherTotal = otherActions.reduce((sum, item) => sum + item.actionCount, 0);
    const otherPercentage = otherActions.reduce((sum, item) => sum + item.percentage, 0);
    rawChartData = [
      ...topActions,
      {
        actionType: "Others",
        actionCount: otherTotal,
        percentage: otherPercentage,
      },
    ];
  }

  const chartData = rawChartData.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));

  const totalActions = breakdown.reduce((sum, item) => sum + item.actionCount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-4 w-4" />
          Action Breakdown
        </CardTitle>
        <CardDescription>
          Distribution of your database actions • {totalActions.toLocaleString()} total actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                label={({ actionType, percentage }) => `${actionType} (${percentage.toFixed(1)}%)`}
                fill="#8884d8"
                dataKey="actionCount"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {chartData.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">
                  {item.actionType}: {item.actionCount.toLocaleString()} (
                  {item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
