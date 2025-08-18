"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  View,
  Columns,
  Eye,
  ChevronDown,
  ChevronRight,
  Loader2,
  ExternalLink,
  Database,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useView } from "@/lib/hooks";
import { ViewDetailsDialog } from "./view-details-dialog";
import { cn } from "@/lib/utils";
import { ViewColumnDto } from "@/lib/types/database";

interface ViewCardProps {
  schemaName: string;
  viewName: string;
  isSystemSchema: boolean;
  className?: string;
}

export function ViewCard({ schemaName, viewName, isSystemSchema, className }: ViewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: detailedView,
    isLoading: detailsLoading,
    error: detailsError,
  } = useView(schemaName, viewName, {
    enabled: isExpanded,
  });

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-8 h-8 rounded flex items-center justify-center ${
                isSystemSchema
                  ? "bg-orange-50 dark:bg-orange-950/20"
                  : "bg-blue-50 dark:bg-blue-950/20"
              }`}
            >
              <View className={`h-4 w-4 ${isSystemSchema ? "text-orange-600" : "text-blue-600"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{viewName}</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                <Database className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{schemaName}</span>
                {isSystemSchema && (
                  <Badge variant="secondary" className="text-xs ml-1 flex-shrink-0">
                    System
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenDialog}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto"
            onClick={handleToggleExpand}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">View Details</span>
              {detailsLoading && isExpanded && <Loader2 className="h-3 w-3 animate-spin" />}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {isExpanded && (
            <div className="space-y-3 pl-2">
              {detailsLoading ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading view details...
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : detailsError ? (
                <div className="text-xs text-destructive p-2 bg-destructive/10 rounded">
                  Failed to load view details.
                </div>
              ) : !detailedView ? (
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                  No detailed information available for this view.
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Columns className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Columns</span>
                      </div>
                      <Badge variant="outline">{detailedView.columns?.length || 0}</Badge>
                    </div>
                    {detailedView.columns && detailedView.columns.length > 0 ? (
                      <>
                        {detailedView.columns
                          .slice(0, 4)
                          .map((column: Omit<ViewColumnDto, "view">, i: number) => {
                            return (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <span className="truncate flex-1">{column.columnName}</span>
                                <span className="ml-2 text-muted-foreground flex-shrink-0">
                                  {column.dataType}
                                  {column.characterMaxLength && `(${column.characterMaxLength})`}
                                </span>
                              </div>
                            );
                          })}
                        {detailedView.columns.length > 4 && (
                          <div className="text-xs text-muted-foreground">
                            +{detailedView.columns.length - 4} more columns
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground">No columns</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Properties</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Updatable:</span>
                        <Badge
                          variant={detailedView.isUpdatable ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {detailedView.isUpdatable ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Check Option:</span>
                        <Badge
                          variant={detailedView.checkOption ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {detailedView.checkOption ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t space-y-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/database/views/${schemaName}/${viewName}/data`}>
              <Eye className="h-4 w-4 mr-2" />
              Browse View Data
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/database/views/${schemaName}/${viewName}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>

      <ViewDetailsDialog
        schemaName={schemaName}
        viewName={viewName}
        isSystemSchema={isSystemSchema}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </Card>
  );
}
