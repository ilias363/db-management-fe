"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, ArrowLeft, Database, Filter, AlertTriangle } from "lucide-react";
import { useTable, useTableRecords, useDetailedPermissions } from "@/lib/hooks";
import { SortDirection } from "@/lib/types";
import { TableMetadataDto, TableRecordPageDto } from "@/lib/types/database";
import { RecordDataGrid } from "@/components/database/record";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage, LastUpdated } from "@/components/common";

interface TableDataContentProps {
  schemaName: string;
  tableName: string;
}

export function TableDataContent({ schemaName, tableName }: TableDataContentProps) {
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>();
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);

  const [selectedRecords, setSelectedRecords] = useState<Record<string, unknown>[]>([]);
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  const { data: detailedPerms } = useDetailedPermissions(schemaName, tableName);

  const {
    data: table,
    isLoading: tableLoading,
    isError: isTableError,
    error: tableError,
    isEnabled: isTableEnabled,
  } = useTable(schemaName, tableName, {
    enabled: !!schemaName && !!tableName && detailedPerms?.granularPermissions.canRead,
  });

  const {
    data: recordsData,
    isLoading: recordsLoading,
    isError: isRecordsError,
    refetch: refetchRecords,
  } = useTableRecords(
    schemaName,
    tableName,
    {
      page,
      size: pageSize,
      sortBy,
      sortDirection,
    },
    { enabled: isTableEnabled }
  );

  const canViewRecords = detailedPerms?.granularPermissions.canRead || false;
  const canCreateRecords = detailedPerms?.granularPermissions.canWrite || false;
  const canEditRecords = detailedPerms?.granularPermissions.canWrite || false;
  const canDeleteRecords = detailedPerms?.granularPermissions.canDelete || false;
  const isSystemSchema = table?.schema.isSystemSchema || false;

  const handleRefresh = async () => {
    await refetchRecords();
  };

  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortDirection(prev =>
        prev === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC
      );
    } else {
      setSortBy(columnName);
      setSortDirection(SortDirection.ASC);
    }
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleCreateRecords = async (recordsData: Record<string, unknown>[]) => {
    console.log(recordsData);
  };

  const handleEditRecords = async (
    updates: { originalData: Record<string, unknown>; newData: Record<string, unknown> }[]
  ) => {
    console.log(updates);
  };

  const handleDeleteRecords = async () => {
    console.log("Delete selected records:", selectedRecords);
  };

  if (!canViewRecords && !tableLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/database/tables?schema=${encodeURIComponent(schemaName)}`)}
          >
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
              You don&apos;t have permission to view this table records. Contact your administrator
              for access.
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

  if (tableLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/database/tables?schema=${encodeURIComponent(schemaName)}`)
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tables
            </Button>
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-14 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-full mt-4" />
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

  if (isTableError || !table) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/database/tables?schema=${encodeURIComponent(schemaName)}`)}
          >
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
            <h2 className="text-lg font-semibold mb-2">Failed to load data</h2>
            <ErrorMessage
              error={
                tableError?.message ||
                "The table could not be found or you don't have permission to view it."
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/database/tables?schema=${encodeURIComponent(schemaName)}`)}
          >
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
          {canEditRecords && !isSystemSchema && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearchDialog(true)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Advanced Search
            </Button>
          )}
          <LastUpdated onRefresh={handleRefresh} resetTrigger={Number(recordsLoading)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Table Records</CardTitle>
              <CardDescription>View and manage records in the {tableName} table.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recordsLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-36" />
              </div>

              <div className="border rounded-md">
                <div className="p-4 border-b">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>

                {Array.from({ length: pageSize || 5 }).map((_, i) => (
                  <div key={i} className="p-2 border-b last:border-b-0">
                    <div className="flex gap-4 items-center">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-28" />
                      <div className="ml-auto flex gap-2">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </div>
          ) : isRecordsError ? (
            <div className="text-center text-muted-foreground p-12">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Failed to load data</h3>
              <p>Unable to load records for this table</p>
              <Button variant="outline" className="mt-4" onClick={() => refetchRecords()}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="w-full overflow-auto">
              <RecordDataGrid
                table={table !== null ? table : ({} as TableMetadataDto)}
                recordsData={recordsData !== null ? recordsData : ({} as TableRecordPageDto)}
                selectedRecords={selectedRecords}
                onSelectionChange={setSelectedRecords}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                canCreateRecords={canCreateRecords && !isSystemSchema}
                onCreateRecords={handleCreateRecords}
                canEditRecords={canEditRecords}
                onEditRecords={handleEditRecords}
                canDeleteRecords={canDeleteRecords}
                onDeleteRecords={handleDeleteRecords}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
