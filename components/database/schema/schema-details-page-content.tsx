"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Table,
  View,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchema, useDetailedPermissions } from "@/lib/hooks";
import { ConfirmDialog } from "@/components/common";
import { ErrorMessage } from "@/components/common";
import { toast } from "sonner";
import { LastUpdated } from "@/components/common";

interface SchemaDetailsPageContentProps {
  schemaName: string;
}

export function SchemaDetailsPageContent({ schemaName }: SchemaDetailsPageContentProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const prevFetchingRef = useRef(false);

  // Fetch detailed permissions for this specific schema
  const { data: detailedPerms } = useDetailedPermissions(schemaName, undefined);

  // Fetch schema details
  const {
    data: schema,
    isLoading,
    isError,
    error,
    isFetching: schemaFetching,
    refetch: refetchSchema,
  } = useSchema(schemaName, {
    enabled: !!schemaName && detailedPerms?.granularPermissions.canRead,
  });

  // Track when a server fetch completes to update the LastUpdated component
  useEffect(() => {
    if (prevFetchingRef.current && !schemaFetching) {
      setFetchTrigger(prev => prev + 1);
    }
    prevFetchingRef.current = schemaFetching;
  }, [schemaFetching]);

  // Check permissions for read and delete
  const canViewSchema = detailedPerms?.granularPermissions?.canRead;
  const canDeleteSchema = detailedPerms?.granularPermissions?.canDelete && !schema?.isSystemSchema;

  // Show permission error if user can't view the schema
  if (!canViewSchema && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schemas
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schema Details</h1>
            <p className="text-muted-foreground">Schema &ldquo;{schemaName}&rdquo;</p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have permission to view this schema. Contact your administrator for
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

  const handleDeleteSchema = async () => {
    if (!schema || !canDeleteSchema) return;

    try {
      // TODO: Implement actual delete API call
      // await deleteSchema(schemaName);

      // For now, just show a success message
      toast.success(`Schema "${schemaName}" would be deleted (API not implemented yet)`);
      setIsDeleteDialogOpen(false);
      router.push("/database/schemas");
    } catch (error) {
      console.error("Error deleting schema:", error);
      toast.error("Failed to delete schema");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-20" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !schema) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schemas
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schema Details</h1>
            <p className="text-muted-foreground">
              {schemaName ? `Schema "${schemaName}"` : "Detailed information about schema"}
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
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tables = schema.tables || [];
  const views = schema.views || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schemas
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schema Details</h1>
            <p className="text-muted-foreground">Detailed information about {schema.schemaName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canDeleteSchema && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Schema
            </Button>
          )}
          <LastUpdated onRefresh={refetchSchema} resetTrigger={fetchTrigger} />
        </div>
      </div>

      {/* Schema Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                schema.isSystemSchema
                  ? "bg-orange-50 dark:bg-orange-950/20"
                  : "bg-blue-50 dark:bg-blue-950/20"
              }`}
            >
              <Database
                className={`h-5 w-5 ${schema.isSystemSchema ? "text-orange-600" : "text-blue-600"}`}
              />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{schema.schemaName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {schema.isSystemSchema ? (
                  <Badge variant="secondary" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    System Schema
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    User Schema
                  </Badge>
                )}
                {schema.creationDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Created {new Date(schema.creationDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Table className="h-3 w-3" />
                  {tables.length} table{tables.length !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1">
                  <View className="h-3 w-3" />
                  {views.length} view{views.length !== 1 ? "s" : ""}
                </div>
                {schema.isSystemSchema && (
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    Read-only system schema
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tables and Views - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tables Section */}
        <Card className="flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Tables</CardTitle>
              </div>
              <Badge variant="outline">{tables.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {tables.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {tables.map(table => (
                  <div
                    key={table.tableName}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Table className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/database/tables/${schema.schemaName}/${table.tableName}`}
                          className="font-medium text-primary hover:underline block truncate"
                          title={table.tableName}
                        >
                          {table.tableName}
                        </Link>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>{table.rowCount?.toLocaleString() || 0} rows</div>
                          {table.sizeInBytes && (
                            <div className="text-xs">
                              Size:{" "}
                              {typeof table.sizeInBytes === "string"
                                ? table.sizeInBytes
                                : `${table.sizeInBytes} bytes`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Table className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No tables found in this schema</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Views Section */}
        <Card className="flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <View className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Views</CardTitle>
              </div>
              <Badge variant="outline">{views.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {views.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {views.map(view => (
                  <div
                    key={view.viewName}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <View className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/database/views/${schema.schemaName}/${view.viewName}`}
                          className="font-medium text-primary hover:underline block truncate"
                          title={view.viewName}
                        >
                          {view.viewName}
                        </Link>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {view.isUpdatable !== undefined && (
                            <div className="text-xs">
                              {view.isUpdatable ? "Updatable" : "Read-only"}
                            </div>
                          )}
                          {view.checkOption !== undefined && view.checkOption && (
                            <div className="text-xs">Check option enabled</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <View className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No views found in this schema</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Schema"
        description={`This action will permanently delete the schema &ldquo;${schema.schemaName}&rdquo; and all its contents. This cannot be undone.`}
        confirmText="Delete Schema"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteSchema}
      >
        {(tables.length > 0 || views.length > 0) && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">
                Warning: This schema contains data
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              {tables.length > 0 && (
                <div>
                  • {tables.length} table{tables.length > 1 ? "s" : ""} will be deleted
                </div>
              )}
              {views.length > 0 && (
                <div>
                  • {views.length} view{views.length > 1 ? "s" : ""} will be deleted
                </div>
              )}
              <div className="font-medium mt-2">All data will be permanently lost.</div>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
