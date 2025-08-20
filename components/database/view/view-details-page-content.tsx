"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, View, Database, AlertTriangle, Edit, Trash2 } from "lucide-react";

import { useView, useDetailedPermissions } from "@/lib/hooks";

import { LastUpdated } from "@/components/common/last-updated";
import { ConfirmDialog, ErrorMessage } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { RenameViewDialog } from "./rename-view-dialog";
import { ViewColumnTable } from "./view-column-table";
import { useQueryClient } from "@tanstack/react-query";
import { schemaQueries, viewQueries } from "@/lib/queries";
import { ViewMetadataDto } from "@/lib/types/database";
import { toast } from "sonner";
import { deleteView } from "@/lib/actions/database";

interface ViewDetailsPageContentProps {
  schemaName: string;
  viewName: string;
}

export function ViewDetailsPageContent({ schemaName, viewName }: ViewDetailsPageContentProps) {
  const router = useRouter();

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [disableViewFetch, setDisableViewFetch] = useState(false);

  const [fetchTrigger, setFetchTrigger] = useState(0);
  const prevFetchingRef = useRef(false);

  const queryClient = useQueryClient();

  const { data: detailedPerms } = useDetailedPermissions(schemaName, viewName);

  const {
    data: view,
    isLoading,
    isError,
    error,
    isFetching: viewFetching,
    refetch: refetchView,
  } = useView(schemaName, viewName, {
    enabled:
      !!schemaName && !!viewName && detailedPerms?.granularPermissions.canRead && !disableViewFetch,
  });

  useEffect(() => {
    if (prevFetchingRef.current && !viewFetching) {
      setFetchTrigger(prev => prev + 1);
    }
    prevFetchingRef.current = viewFetching;
  }, [viewFetching]);

  const canViewView = detailedPerms?.granularPermissions?.canRead;
  const canModifyView = detailedPerms?.granularPermissions?.canWrite;
  const canDeleteView = detailedPerms?.granularPermissions?.canDelete;
  const isSystemSchema = view?.schema?.isSystemSchema || false;

  const handleRefresh = () => {
    refetchView();
  };

  const onRenameSuccess = async (view: ViewMetadataDto) => {
    setDisableViewFetch(true);
    router.replace(`/database/views/${schemaName}/${view.viewName}`);
  };

  const handleDeleteView = async () => {
    if (!view || !canDeleteView) return;

    try {
      const result = await deleteView(schemaName, viewName);

      if (result.success) {
        toast.success(result.message);
        router.push(`/database/views?schema=${encodeURIComponent(schemaName)}`);

        queryClient.invalidateQueries({
          queryKey: schemaQueries.detail(schemaName).queryKey,
        });

        queryClient.invalidateQueries({
          queryKey: viewQueries.all(),
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting view:", error);
      toast.error("Failed to delete view");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  if (!canViewView && !isLoading) {
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
                : "bg-blue-50 dark:bg-blue-950/20"
            }`}
          >
            <View className={`h-5 w-5 ${isSystemSchema ? "text-orange-600" : "text-blue-600"}`} />
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
              You don&apos;t have permission to view this view. Contact your administrator for
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push(`/database/views?schema=${encodeURIComponent(schemaName)}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Views
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !view) {
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
                : "bg-blue-50 dark:bg-blue-950/20"
            }`}
          >
            <View className={`h-5 w-5 ${isSystemSchema ? "text-orange-600" : "text-blue-600"}`} />
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
            <h2 className="text-lg font-semibold mb-2">Failed to load view</h2>
            <ErrorMessage
              error={
                error?.message ||
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
      <div className="flex items-center justify-between">
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
                : "bg-blue-50 dark:bg-blue-950/20"
            }`}
          >
            <View className={`h-5 w-5 ${isSystemSchema ? "text-orange-600" : "text-blue-600"}`} />
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/database/views/${schemaName}/${viewName}/data`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Browse Data
          </Button>
          {canModifyView && !isSystemSchema && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRenameDialogOpen(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Rename View
            </Button>
          )}
          {canDeleteView && !isSystemSchema && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete View
            </Button>
          )}
          <LastUpdated onRefresh={handleRefresh} resetTrigger={fetchTrigger} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>Configuration and properties of the view</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Updatable</h4>
              <Badge variant={view.isUpdatable ? "default" : "secondary"}>
                {view.isUpdatable ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Check Option</h4>
              <Badge variant={view.checkOption ? "default" : "secondary"}>
                {view.checkOption ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Character Set</h4>
              <p className="text-sm text-muted-foreground">{view.charachterSet ?? "--"}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Collation</h4>
              <p className="text-sm text-muted-foreground">{view.collation ?? "--"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>View Definition</CardTitle>
          <CardDescription>SQL definition for {view.viewName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md overflow-x-auto">
            <code className="text-sm whitespace-pre-wrap">{view.viewDefinition}</code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Columns</CardTitle>
          <CardDescription>Column definitions for {view.viewName}</CardDescription>
        </CardHeader>
        <CardContent>
          <ViewColumnTable view={view} />
        </CardContent>
      </Card>

      <RenameViewDialog
        view={view}
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        onSuccess={onRenameSuccess}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Schema"
        description={`This action will permanently delete the view &ldquo;${viewName}&rdquo;. This cannot be undone.`}
        confirmText="Delete Schema"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteView}
      />
    </div>
  );
}
