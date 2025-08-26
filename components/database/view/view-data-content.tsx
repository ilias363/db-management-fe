"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, ArrowLeft, Database, AlertTriangle, ExternalLink } from "lucide-react";
import { useView, useViewRecordsSearch, useDetailedPermissions } from "@/lib/hooks";
import { SortDirection } from "@/lib/types";
import { RecordAdvancedSearchDto, ViewRecordPageDto } from "@/lib/types/database";
import { RecordDataGrid, AdvancedSearch } from "@/components/database/record";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage, LastUpdated } from "@/components/common";
import Link from "next/link";

interface ViewDataContentProps {
  schemaName: string;
  viewName: string;
}

export function ViewDataContent({ schemaName, viewName }: ViewDataContentProps) {
  const router = useRouter();

  const [searchParams, setSearchParams] = useState<RecordAdvancedSearchDto>({
    schemaName,
    objectName: viewName,
    page: 0,
    size: 10,
  });

  useEffect(() => {
    setSearchParams(prev => ({
      ...prev,
      schemaName,
      objectName: viewName,
      page: 0,
    }));
  }, [schemaName, viewName]);

  const { data: detailedPerms } = useDetailedPermissions(schemaName, viewName);

  const {
    data: view,
    isLoading: viewLoading,
    isError: isViewError,
    error: viewError,
    isEnabled: isViewEnabled,
  } = useView(schemaName, viewName, {
    enabled: !!schemaName && !!viewName && detailedPerms?.granularPermissions.canRead,
  });

  const {
    data: recordsResponse,
    isLoading: recordsLoading,
    isError: isRecordsError,
    refetch: refetchRecords,
  } = useViewRecordsSearch(searchParams, {
    enabled: isViewEnabled,
  });

  const recordsData = recordsResponse
    ? ({
        items: recordsResponse.records,
        totalItems: recordsResponse.filteredRecords,
        totalPages: recordsResponse.totalPages,
        currentPage: recordsResponse.currentPage,
        pageSize: recordsResponse.pageSize,
        schemaName: recordsResponse.schemaName,
        viewName: recordsResponse.objectName,
      } as ViewRecordPageDto)
    : null;

  const canViewRecords = detailedPerms?.granularPermissions.canRead || false;
  const isSystemSchema = view?.schema.isSystemSchema || false;

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
      objectName: viewName,
      page: 0,
      size: searchParams.size || 10,
    });
  }, [schemaName, viewName, searchParams.size]);

  const handleSort = (columnName: string) => {
    const currentSort = searchParams.sorts?.[0];
    const newDirection =
      currentSort?.columnName === columnName && currentSort?.direction === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC;

    console.log("the sort : ", columnName, currentSort, newDirection);
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

  if (!canViewRecords && !viewLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/database/views?schema=${encodeURIComponent(schemaName)}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Views
          </Button>
          <div
            className={`w-8 h-8 rounded flex items-center justify-center ${
              isSystemSchema
                ? "bg-orange-50 dark:bg-orange-950/20"
                : "bg-green-50 dark:bg-green-950/20"
            }`}
          >
            <Eye className={`h-5 w-5 ${isSystemSchema ? "text-orange-600" : "text-green-600"}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{viewName}</h1>
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
              You don&apos;t have permission to view this view records. Contact your administrator
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

  if (viewLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/database/views?schema=${encodeURIComponent(schemaName)}`)
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Views
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

  if (isViewError || !view) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/database/views?schema=${encodeURIComponent(schemaName)}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Views
          </Button>
          <div
            className={`w-8 h-8 rounded flex items-center justify-center ${
              isSystemSchema
                ? "bg-orange-50 dark:bg-orange-950/20"
                : "bg-green-50 dark:bg-green-950/20"
            }`}
          >
            <Eye className={`h-5 w-5 ${isSystemSchema ? "text-orange-600" : "text-green-600"}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{viewName}</h1>
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
                viewError?.message ||
                "The view could not be found or you don't have permission to view it."
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
            onClick={() => router.push(`/database/views?schema=${encodeURIComponent(schemaName)}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Views
          </Button>
          <div
            className={`w-8 h-8 rounded flex items-center justify-center ${
              isSystemSchema
                ? "bg-orange-50 dark:bg-orange-950/20"
                : "bg-green-50 dark:bg-green-950/20"
            }`}
          >
            <Eye className={`h-5 w-5 ${isSystemSchema ? "text-orange-600" : "text-green-600"}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{viewName}</h1>
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
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/database/views/${schemaName}/${viewName}`}>
              <ExternalLink className="h-4 w-4" />
              Go To Details
            </Link>
          </Button>
          <LastUpdated onRefresh={handleRefresh} resetTrigger={Number(recordsLoading)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">View Records</CardTitle>
              <CardDescription>View records from the {viewName} view (read-only).</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view && (
            <div className="mb-6">
              <AdvancedSearch
                object={view}
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
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-28" />
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
              <p>Unable to load records for this view</p>
              <Button variant="outline" className="mt-4" onClick={() => refetchRecords()}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="w-full overflow-auto">
              <RecordDataGrid
                object={view}
                recordsData={recordsData!}
                enableSelection={false}
                sortBy={searchParams.sorts?.[0]?.columnName}
                sortDirection={searchParams.sorts?.[0]?.direction || SortDirection.ASC}
                onSort={handleSort}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                canCreateRecords={false}
                canEditRecords={false}
                canDeleteRecords={false}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
