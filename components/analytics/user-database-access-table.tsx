"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserDatabaseAccess } from "@/lib/hooks";
import { Database, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function UserDatabaseAccessTable() {
  const { data: databaseAccess, isLoading, error } = useUserDatabaseAccess();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Access Summary
          </CardTitle>
          <CardDescription>Your database schema access patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-6 w-[60px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !databaseAccess || databaseAccess.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Access Summary
          </CardTitle>
          <CardDescription>Your database schema access patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-muted-foreground">
              {error ? "Failed to load database access data" : "No database access recorded"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatLastAccessed = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  const totalAccess = databaseAccess.reduce((sum, item) => sum + item.accessCount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Database Access Summary
        </CardTitle>
        <CardDescription>
          Your database schema access patterns • {totalAccess.toLocaleString()} total accesses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center mb-6">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-semibold">{databaseAccess.length}</div>
            <div className="text-xs text-muted-foreground">Schemas Accessed</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-lg font-semibold">
              {Math.round(totalAccess / databaseAccess.length)}
            </div>
            <div className="text-xs text-muted-foreground">Avg. access per Schema</div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {databaseAccess.map(access => (
            <div
              key={access.schemaName}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-sm truncate">{access.schemaName}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last accessed: {formatLastAccessed(access.lastAccessed)}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Activity className="h-3 w-3" />
                  {access.accessCount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {((access.accessCount / totalAccess) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
