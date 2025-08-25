"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, BarChart3 } from "lucide-react";
import type { AnalyticsTimeRange } from "@/lib/types";

interface DateRangePickerProps {
  timeRange: AnalyticsTimeRange;
  onTimeRangeChange: (timeRange: AnalyticsTimeRange) => void;
  className?: string;
}

export function DateRangePicker({ timeRange, onTimeRangeChange, className }: DateRangePickerProps) {
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Initialize with default dates if using custom range
  useEffect(() => {
    if (timeRange.startDate || timeRange.endDate) {
      setUseCustomRange(true);
    }
  }, [timeRange.startDate, timeRange.endDate]);

  const handleRangeTypeChange = (useCustom: boolean) => {
    setUseCustomRange(useCustom);

    if (useCustom) {
      if (!timeRange.startDate || !timeRange.endDate) {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        onTimeRangeChange({
          ...timeRange,
          startDate: lastWeek.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
          period: timeRange.period || "day",
        });
      } else {
        onTimeRangeChange({
          ...timeRange,
          period: timeRange.period || "day",
        });
      }
    } else {
      onTimeRangeChange({
        period: timeRange.period || "week",
      });
    }
  };

  const handlePeriodChange = (period: string) => {
    onTimeRangeChange({
      ...timeRange,
      period: period as "hour" | "day" | "week" | "month",
    });
  };

  const handleStartDateChange = (startDate: string) => {
    onTimeRangeChange({
      ...timeRange,
      startDate,
    });
  };

  const handleEndDateChange = (endDate: string) => {
    onTimeRangeChange({
      ...timeRange,
      endDate,
    });
  };

  const handleQuickRange = (days: number) => {
    const today = new Date();
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    onTimeRangeChange({
      ...timeRange,
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    });
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <Label className="text-sm font-medium">Date Range & Period</Label>
          </div>

          <div className="flex gap-2">
            <Button
              variant={!useCustomRange ? "default" : "outline"}
              size="sm"
              onClick={() => handleRangeTypeChange(false)}
              className="text-xs"
            >
              Preset Range
            </Button>
            <Button
              variant={useCustomRange ? "default" : "outline"}
              size="sm"
              onClick={() => handleRangeTypeChange(true)}
              className="text-xs"
            >
              Custom Range
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              <Label className="text-xs font-medium text-muted-foreground">
                {useCustomRange ? "SELECT DATE RANGE" : "PRESET RANGE"}
              </Label>
            </div>

            {useCustomRange ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Start Date</Label>
                    <DatePicker
                      value={timeRange.startDate || ""}
                      onValueChange={handleStartDateChange}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End Date</Label>
                    <DatePicker
                      value={timeRange.endDate || ""}
                      onValueChange={handleEndDateChange}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(7)}
                    className="text-xs"
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(30)}
                    className="text-xs"
                  >
                    Last 30 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(90)}
                    className="text-xs"
                  >
                    Last 90 days
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Using preset range based on selected period
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
              <Label className="text-xs font-medium text-muted-foreground">
                DATA AGGREGATION PERIOD
              </Label>
            </div>

            <div className="flex flex-col gap-2">
              <Select value={timeRange.period || "day"} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select aggregation period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hour">Hourly</SelectItem>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-xs text-muted-foreground">
                {useCustomRange && timeRange.startDate && timeRange.endDate && timeRange.period && (
                  <>
                    Data from {new Date(timeRange.startDate).toLocaleDateString()} to{" "}
                    {new Date(timeRange.endDate).toLocaleDateString()}, aggregated by{" "}
                    <span className="font-medium">{timeRange.period}</span>
                  </>
                )}
                {!useCustomRange && timeRange.period && (
                  <>
                    Data from the last{" "}
                    <span className="font-medium">
                      {timeRange.period === "hour"
                        ? "24 hours"
                        : timeRange.period === "day"
                        ? "30 days"
                        : timeRange.period === "week"
                        ? "12 weeks"
                        : "12 months"}
                    </span>
                    , aggregated by <span className="font-medium">{timeRange.period}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
