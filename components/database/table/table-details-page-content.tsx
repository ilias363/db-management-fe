"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Table,
  Columns,
  Hash,
  HardDrive,
  BarChart3,
  Edit,
  Trash2,
  Database,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { useTable, useDetailedPermissions } from "@/lib/hooks";
import { formatBytes } from "@/lib/utils";

import { LastUpdated } from "@/components/common/last-updated";
import { ErrorMessage, StatsCard } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { ColumnTable } from "./table-column";
import { IndexTable } from "./table-index";

interface TableDetailsPageContentProps {
  schemaName: string;
  tableName: string;
}

export function TableDetailsPageContent({ schemaName, tableName }: TableDetailsPageContentProps) {
  const router = useRouter();
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const prevFetchingRef = useRef(false);

  const { data: detailedPerms } = useDetailedPermissions(schemaName, tableName);

  const {
    data: table,
    isLoading,
    isError,
    error,
    isFetching: tableFetching,
    refetch: refetchTable,
  } = useTable(schemaName, tableName, {
    enabled: !!schemaName && !!tableName && detailedPerms?.granularPermissions.canRead,
  });

  useEffect(() => {
    if (prevFetchingRef.current && !tableFetching) {
      setFetchTrigger(prev => prev + 1);
    }
    prevFetchingRef.current = tableFetching;
  }, [tableFetching]);

  const canViewTable = detailedPerms?.granularPermissions.canRead || false;
  const canModifyTable = detailedPerms?.granularPermissions.canWrite || false;
  const canDeleteTable = detailedPerms?.granularPermissions.canDelete || false;
  const isSystemSchema = table?.schema.isSystemSchema || false;

  const handleRefresh = async () => {
    await refetchTable();
  };

  if (!canViewTable && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tables
          </Button>
          <div
            className={`w-8 h-8 rounded flex items-center justify-center ${
              isSystemSchema
                ? "bg-orange-50 dark:bg-orange-950/20"
                : "bg-purple-50 dark:bg-purple-950/20"
            }`}
          >
            <Table
              className={`h-5 w-5 ${isSystemSchema ? "text-orange-600" : "text-purple-600"}`}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tableName}</h1>
            <p className="text-muted-foreground">
              in schema{" "}
              <Badge variant="outline" className="text-xs">
                {schemaName}
              </Badge>
              {isSystemSchema && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  SYSTEM
                </Badge>
              )}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have permission to view this table. Contact your administrator for
              access.
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tables
            </Button>
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-14 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-full mt-4" />
            <Skeleton className="h-8 w-full mt-2" />
            <Skeleton className="h-8 w-full mt-2" />
            <Skeleton className="h-8 w-full mt-2" />
            <Skeleton className="h-8 w-full mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !table) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tables
          </Button>
          <div
            className={`w-8 h-8 rounded flex items-center justify-center ${
              isSystemSchema
                ? "bg-orange-50 dark:bg-orange-950/20"
                : "bg-purple-50 dark:bg-purple-950/20"
            }`}
          >
            <Table
              className={`h-5 w-5 ${isSystemSchema ? "text-orange-600" : "text-purple-600"}`}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tableName}</h1>
            <p className="text-muted-foreground">
              in schema{" "}
              <Badge variant="outline" className="text-xs">
                {schemaName}
              </Badge>
              {isSystemSchema && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  SYSTEM
                </Badge>
              )}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
            <h2 className="text-lg font-semibold mb-2">Failed to load schema</h2>
            <ErrorMessage
              error={
                error?.message ||
                "The schema could not be found or you don't have permission to view it."
              }
            />
            <div className="mt-4 space-x-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tables
          </Button>
          <div
            className={`w-8 h-8 rounded flex items-center justify-center ${
              isSystemSchema
                ? "bg-orange-50 dark:bg-orange-950/20"
                : "bg-purple-50 dark:bg-purple-950/20"
            }`}
          >
            <Table
              className={`h-5 w-5 ${isSystemSchema ? "text-orange-600" : "text-purple-600"}`}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{tableName}</h1>
            <p className="text-muted-foreground">
              in schema{" "}
              <Badge variant="outline" className="text-xs">
                {schemaName}
              </Badge>
              {isSystemSchema && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  SYSTEM
                </Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canModifyTable && !isSystemSchema && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("To be implemented")}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Rename Table
            </Button>
          )}
          {canDeleteTable && !isSystemSchema && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => toast.info("To be implemented")}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Table
            </Button>
          )}
          <LastUpdated onRefresh={handleRefresh} resetTrigger={fetchTrigger} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-4">
        <StatsCard title="Column Count" value={table.columnCount} icon={Columns} description="" />
        <StatsCard
          title="Row Count"
          value={table.rowCount.toLocaleString()}
          icon={Hash}
          description=""
        />
        <StatsCard
          title="Index Count"
          value={table.indexes.length}
          icon={BarChart3}
          description=""
        />
        <StatsCard
          title="Table Size"
          value={formatBytes(table.sizeInBytes)}
          icon={HardDrive}
          description=""
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Table Structure</CardTitle>
              <CardDescription>Columns and their properties in {table.tableName}</CardDescription>
            </div>
            {canModifyTable && !isSystemSchema && (
              <Button size="sm" onClick={() => toast.info("To be implemented")} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ColumnTable table={table} canModify={canModifyTable} canDelete={canDeleteTable} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Table Indexes</CardTitle>
              <CardDescription>Database indexes for improved query performance</CardDescription>
            </div>
            {canModifyTable && !isSystemSchema && (
              <Button size="sm" onClick={() => toast.info("To be implemented")} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Index
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <IndexTable table={table} canDelete={canDeleteTable} />
        </CardContent>
      </Card>
    </div>
  );
}
