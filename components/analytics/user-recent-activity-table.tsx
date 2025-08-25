"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUserRecentActivity } from "@/lib/hooks";
import { Clock, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function UserRecentActivityTable() {
  const { data: activities, isLoading, error } = useUserRecentActivity(20);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest database actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[300px]" />
                </div>
                <Skeleton className="h-5 w-[60px] rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest database actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-muted-foreground">
              {error ? "Failed to load recent activity" : "No recent activity"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest database actions • {activities.length} recent actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {activities.map(activity => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    {activity.actionType}
                  </Badge>
                  <span className="font-medium text-sm truncate">
                    {activity.tableName || activity.objectName || "N/A"}
                  </span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground space-x-4">
                  <span>Schema: {activity.schemaName || "N/A"}</span>
                  <span className={`${activity.successful ? "text-green-600" : "text-red-600"}`}>
                    {activity.successful ? "Success" : "Failed"}
                  </span>
                  {activity.actionDetails && (
                    <span className="truncate inline-block max-w-72" title={activity.actionDetails}>
                      Details: {activity.actionDetails}
                    </span>
                  )}
                  {activity.errorMessage && (
                    <span
                      className="truncate inline-block max-w-72 text-red-600"
                      title={activity.errorMessage}
                    >
                      Error: {activity.errorMessage}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-xs text-muted-foreground">
                  {formatTimestamp(activity.auditTimestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
