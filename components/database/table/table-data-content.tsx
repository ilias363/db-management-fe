"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, ArrowLeft, Database, AlertTriangle } from "lucide-react";
import {
  useTable,
  useTableRecordsSearch,
  useDetailedPermissions,
  useDeleteRecordMutation,
  useDeleteRecordsMutation,
  useDeleteStrategy,
} from "@/lib/hooks";
import { SortDirection } from "@/lib/types";
import {
  TableMetadataDto,
  TableRecordPageDto,
  RecordAdvancedSearchDto,
} from "@/lib/types/database";
import { RecordDataGrid, AdvancedSearch } from "@/components/database/record";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage, LastUpdated, ConfirmDialog } from "@/components/common";

interface TableDataContentProps {
  schemaName: string;
  tableName: string;
}

export function TableDataContent({ schemaName, tableName }: TableDataContentProps) {
  const router = useRouter();

  const [selectedRecords, setSelectedRecords] = useState<Record<string, unknown>[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [recordsToDelete, setRecordsToDelete] = useState<Record<string, unknown>[]>([]);

  const [searchParams, setSearchParams] = useState<RecordAdvancedSearchDto>({
    schemaName,
    objectName: tableName,
    page: 0,
    size: 10,
  });

  useEffect(() => {
    setSearchParams(prev => ({
      ...prev,
      schemaName,
      objectName: tableName,
      page: 0,
    }));
  }, [schemaName, tableName]);

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
    data: recordsResponse,
    isLoading: recordsLoading,
    isError: isRecordsError,
    refetch: refetchRecords,
  } = useTableRecordsSearch(searchParams, {
    enabled: isTableEnabled,
  });

  const deleteStrategy = useDeleteStrategy(table?.columns || []);

  const deleteSingleRecordMutation = useDeleteRecordMutation({
    schemaName,
    tableName,
    columns: table?.columns || [],
    onSuccess: () => {
      refetchRecords();
      setSelectedRecords([]);
      setShowDeleteConfirmation(false);
      setRecordsToDelete([]);
    },
    onError: error => {
      console.error("Failed to delete record:", error);
      setShowDeleteConfirmation(false);
      setRecordsToDelete([]);
    },
  });

  const deleteMultipleRecordsMutation = useDeleteRecordsMutation({
    schemaName,
    tableName,
    columns: table?.columns || [],
    onSuccess: () => {
      refetchRecords();
      setSelectedRecords([]);
      setShowDeleteConfirmation(false);
      setRecordsToDelete([]);
    },
    onError: error => {
      console.error("Failed to delete records:", error);
      setShowDeleteConfirmation(false);
      setRecordsToDelete([]);
    },
  });

  const recordsData = recordsResponse
    ? ({
        items: recordsResponse.records,
        totalItems: recordsResponse.filteredRecords,
        totalPages: recordsResponse.totalPages,
        currentPage: recordsResponse.currentPage,
        pageSize: recordsResponse.pageSize,
        schemaName: recordsResponse.schemaName,
        tableName: recordsResponse.objectName,
      } as TableRecordPageDto)
    : null;

  const canViewRecords = detailedPerms?.granularPermissions.canRead || false;
  const canCreateRecords = detailedPerms?.granularPermissions.canWrite || false;
  const canEditRecords = detailedPerms?.granularPermissions.canWrite || false;
  const canDeleteRecords =
    (detailedPerms?.granularPermissions.canDelete || false) &&
    deleteStrategy.canDelete &&
    !(deleteSingleRecordMutation.isPending || deleteMultipleRecordsMutation.isPending);
  const isSystemSchema = table?.schema.isSystemSchema || false;

  const handleRefresh = async () => {
    await refetchRecords();
  };

  const handleAdvancedSearch = useCallback(
    (newSearchParams: RecordAdvancedSearchDto) => {
      setSearchParams({
        ...newSearchParams,
        page: 0,
        size: newSearchParams.size || searchParams.size || 10,
      });
    },
    [searchParams.size]
  );

  const handleClearAdvancedSearch = useCallback(() => {
    setSearchParams({
      schemaName,
      objectName: tableName,
      page: 0,
      size: searchParams.size || 10,
    });
  }, [schemaName, tableName, searchParams.size]);

  const handleSort = (columnName: string) => {
    const currentSort = searchParams.sorts?.[0];
    const newDirection =
      currentSort?.columnName === columnName && currentSort?.direction === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC;

    setSearchParams(prev => ({
      ...prev,
      page: 0,
      sorts: [{ columnName, direction: newDirection }],
    }));
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchParams(prev => ({
      ...prev,
      page: 0,
      size: newSize,
    }));
  };

  const handleCreateRecords = async (recordsData: Record<string, unknown>[]) => {
    console.log(recordsData);
  };

  const handleEditRecords = async (
    updates: { originalData: Record<string, unknown>; newData: Record<string, unknown> }[]
  ) => {
    console.log(updates);
  };

  const handleDeleteRecords = (records: Record<string, unknown>[]) => {
    if (!canDeleteRecords) return;

    setRecordsToDelete(records);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (recordsToDelete.length === 1) {
      deleteSingleRecordMutation.mutate(recordsToDelete[0]);
    } else if (recordsToDelete.length > 1) {
      deleteMultipleRecordsMutation.mutate(recordsToDelete);
    }
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

        <LastUpdated onRefresh={handleRefresh} resetTrigger={Number(recordsLoading)} />
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
          {table && (
            <div className="mb-6">
              <AdvancedSearch
                table={table}
                onSearch={handleAdvancedSearch}
                onClear={handleClearAdvancedSearch}
                isLoading={recordsLoading}
                defaultExpanded={false}
              />
            </div>
          )}

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

                {Array.from({ length: searchParams.size || 5 }).map((_, i) => (
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
                sortBy={searchParams.sorts?.[0]?.columnName}
                sortDirection={searchParams.sorts?.[0]?.direction || SortDirection.ASC}
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

      <ConfirmDialog
        title="Delete Records"
        description={
          recordsToDelete.length === 1
            ? "Are you sure you want to delete this record? This action cannot be undone."
            : `Are you sure you want to delete these ${recordsToDelete.length} records? This action cannot be undone.`
        }
        open={showDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        onOpenChange={setShowDeleteConfirmation}
        confirmText={
          deleteSingleRecordMutation.isPending || deleteMultipleRecordsMutation.isPending
            ? "Deleting..."
            : "Delete"
        }
        confirmDisabled={
          deleteSingleRecordMutation.isPending || deleteMultipleRecordsMutation.isPending
        }
        preventClose={
          deleteSingleRecordMutation.isPending || deleteMultipleRecordsMutation.isPending
        }
        variant="destructive"
      >
        {deleteStrategy && (
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Deletion method:</strong>{" "}
              {deleteStrategy.strategy === "primary-key"
                ? `Using primary key columns (${deleteStrategy.primaryKeyColumns
                    .map(col => col.columnName)
                    .join(", ")})`
                : deleteStrategy.strategy === "unique-column"
                ? `Using unique column (${deleteStrategy.uniqueColumns[0]?.columnName})`
                : "Using all column values"}
            </p>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
