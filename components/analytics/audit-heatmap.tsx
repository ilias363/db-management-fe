"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock } from "lucide-react";
import { useAuditHeatmap } from "@/lib/hooks/use-analytics";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIME_PERIODS = [
  { label: "Night", subLabel: "1AM-8AM", hours: [1, 2, 3, 4, 5, 6, 7, 8] },
  { label: "9AM", hours: [9] },
  { label: "10AM", hours: [10] },
  { label: "11AM", hours: [11] },
  { label: "12PM", hours: [12] },
  { label: "1PM", hours: [13] },
  { label: "2PM", hours: [14] },
  { label: "3PM", hours: [15] },
  { label: "4PM", hours: [16] },
  { label: "5PM", hours: [17] },
  { label: "6PM", hours: [18] },
  { label: "7PM", hours: [19] },
  { label: "Evening", subLabel: "8PM-12AM", hours: [20, 21, 22, 23, 0] },
];

interface AuditHeatmapProps {
  className?: string;
}

function getIntensityColor(count: number, maxCount: number): { bg: string; text: string } {
  if (count === 0) {
    return {
      bg: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
      text: "text-gray-400",
    };
  }

  const intensity = count / maxCount;

  if (intensity <= 0.2) {
    return {
      bg: "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/40",
      text: "text-blue-700 dark:text-blue-300",
    };
  } else if (intensity <= 0.4) {
    return {
      bg: "bg-blue-200 hover:bg-blue-300 dark:bg-blue-800/50 dark:hover:bg-blue-800/60",
      text: "text-blue-800 dark:text-blue-200",
    };
  } else if (intensity <= 0.6) {
    return {
      bg: "bg-blue-400 hover:bg-blue-500 dark:bg-blue-700/70 dark:hover:bg-blue-700/80",
      text: "text-white",
    };
  } else if (intensity <= 0.8) {
    return {
      bg: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600/80 dark:hover:bg-blue-600/90",
      text: "text-white",
    };
  } else {
    return {
      bg: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400",
      text: "text-white",
    };
  }
}

export function AuditHeatmap({ className }: AuditHeatmapProps) {
  // Use the hook with no parameters to get all-time data
  const { data: heatmapData, isLoading, error } = useAuditHeatmap();

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Audit Activity Heatmap
          </CardTitle>
          <CardDescription>System activity patterns by day and time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Failed to load heatmap data</div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !heatmapData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Audit Activity Heatmap
          </CardTitle>
          <CardDescription>System activity patterns by day and time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-muted-foreground pl-10">
              <Skeleton className="h-4 w-16" />
              {Array.from({ length: 11 }, (_, i) => (
                <Skeleton key={i} className="h-4 w-12" />
              ))}
              <Skeleton className="h-4 w-16" />
            </div>
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-2">
                <Skeleton className="h-4 w-8" />
                <div className="flex gap-1 flex-1">
                  {TIME_PERIODS.map((_, i) => (
                    <Skeleton key={i} className="h-8 flex-1" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a map for quick lookup of activity counts
  const activityMap = new Map<string, number>();
  heatmapData.forEach(item => {
    activityMap.set(`${item.dayOfWeek - 1}-${item.hourOfDay}`, item.activityCount);
  });

  const maxCount = Math.max(...heatmapData.map(item => item.activityCount));
  const maxCountItem = heatmapData.find(item => item.activityCount === maxCount);

  const totalActivity = heatmapData.reduce((sum, item) => sum + item.activityCount, 0);

  const getTimePeriodCount = (dayIndex: number, hours: number[]): number => {
    return hours.reduce((sum, hour) => sum + (activityMap.get(`${dayIndex}-${hour}`) || 0), 0);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Audit Activity Heatmap
        </CardTitle>
        <CardDescription>
          System activity patterns by day and time • {totalActivity.toLocaleString()} total actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Time labels */}
          <div className="flex justify-between text-xs text-muted-foreground pl-10">
            {TIME_PERIODS.map(period => (
              <div key={period.label} className="text-center min-w-[3rem] flex-1">
                <div className="font-medium">{period.label}</div>
                {period.subLabel && (
                  <div className="text-[10px] text-muted-foreground/70">{period.subLabel}</div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-2">
                <div className="w-8 text-xs text-muted-foreground font-medium text-right">
                  {day}
                </div>
                <div className="flex gap-1 flex-1">
                  {TIME_PERIODS.map(period => {
                    const count = getTimePeriodCount(dayIndex, period.hours);
                    const colors = getIntensityColor(count, maxCount);
                    const periodLabel = period.subLabel ? period.subLabel : period.label;

                    return (
                      <div
                        key={period.label}
                        className={`h-8 flex-1 rounded cursor-pointer transition-colors ${colors.bg} 
                                   flex items-center justify-center text-xs font-medium ${colors.text}
                                   min-w-[2.5rem] border border-gray-200 dark:border-gray-700`}
                        title={`${day} ${periodLabel} - ${count} actions`}
                      >
                        {count > 0 ? count : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="h-3 w-3 rounded bg-blue-100 dark:bg-blue-900/30" />
                <div className="h-3 w-3 rounded bg-blue-200 dark:bg-blue-800/50" />
                <div className="h-3 w-3 rounded bg-blue-400 dark:bg-blue-700/70" />
                <div className="h-3 w-3 rounded bg-blue-500 dark:bg-blue-600/80" />
                <div className="h-3 w-3 rounded bg-blue-600 dark:bg-blue-500" />
              </div>
              <span>More</span>
            </div>

            {maxCountItem && maxCountItem.activityCount > 0 && (
              <div className="text-xs text-muted-foreground">
                Peak: {maxCountItem.activityCount.toLocaleString()} actions on{" "}
                {maxCountItem && DAYS[maxCountItem.dayOfWeek - 1]} at{" "}
                {maxCountItem &&
                  (maxCountItem.hourOfDay === 0
                    ? "12AM"
                    : maxCountItem.hourOfDay < 12
                    ? `${maxCountItem.hourOfDay}AM`
                    : maxCountItem.hourOfDay === 12
                    ? "12PM"
                    : `${maxCountItem.hourOfDay - 12}PM`)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
