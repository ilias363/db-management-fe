"use client";

import { useDatabaseUsage } from "@/lib/hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Database, Table, HardDrive, Clock } from "lucide-react";

interface DatabaseUsageTableProps {
  includeSystem?: boolean;
}

export function DatabaseUsageTable({ includeSystem = true }: DatabaseUsageTableProps) {
  const { data, isLoading, error } = useDatabaseUsage(includeSystem);

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-300">Database Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-600 dark:text-red-400">
            Failed to load database usage data
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Usage Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2 p-3 border rounded-lg">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No database usage data available
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto p-6 space-y-3">
            {data.map(schema => (
              <div
                key={schema.schemaName}
                className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    {schema.schemaName}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(schema.size)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Table className="h-3 w-3 text-teal-500" />
                    <span className="text-muted-foreground">Tables:</span>
                    <span className="font-medium">{schema.tableCount}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3 text-orange-500" />
                    <span className="text-muted-foreground">Records:</span>
                    <span className="font-medium">{schema.recordCount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-purple-500" />
                    <span className="text-muted-foreground">Modified:</span>
                    <span className="font-medium">
                      {schema.lastModified == "unknown"
                        ? schema.lastModified
                        : new Date(schema.lastModified).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Avg/Table:</span>
                    <span className="font-medium">
                      {schema.tableCount > 0
                        ? Math.round(schema.recordCount / schema.tableCount).toLocaleString()
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
