"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface LastUpdatedProps {
  onRefresh?: () => void | Promise<void>;
  className?: string;
}

export const LastUpdated = ({ onRefresh, className }: LastUpdatedProps) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }, []);

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = useCallback(() => {
    const now = currentTime;
    const diffInSeconds = Math.max(Math.floor((now.getTime() - lastUpdated.getTime()) / 1000), 0);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  }, [currentTime, lastUpdated]);

  return (
    <div className={cn("flex items-center gap-3 text-sm text-muted-foreground", className)}>
      <Button
        size="sm"
        variant="outline"
        className="gap-2 h-8"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </Button>

      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <div className="flex flex-col">
          <span className="font-medium">Last updated: {formatTime(lastUpdated)}</span>
          <span className="text-xs text-muted-foreground/70">
            {formatDate(lastUpdated)} • {getTimeAgo()}
          </span>
        </div>
      </div>
    </div>
  );
};
