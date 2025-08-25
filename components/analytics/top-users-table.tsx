"use client";

import { useTopUsersByActivity } from "@/lib/hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award } from "lucide-react";
import type { AnalyticsTimeRange } from "@/lib/types";

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case 1:
      return <Medal className="h-4 w-4 text-gray-400" />;
    case 2:
      return <Award className="h-4 w-4 text-amber-600" />;
    default:
      return <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>;
  }
};

interface TopUsersTableProps {
  timeRange: AnalyticsTimeRange;
}

export function TopUsersTable({ timeRange }: TopUsersTableProps) {
  const { data, isLoading, error } = useTopUsersByActivity({ ...timeRange, limit: 10 });

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-300">Top Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 dark:text-red-400">
            Failed to load top users data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Active Users</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No user activity data available
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((user, index) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(index)}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Last active:{" "}
                      {user.lastActivity == "unknown"
                        ? user.lastActivity
                        : new Date(user.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {user.actionCount} actions
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
