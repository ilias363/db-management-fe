"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Table,
  View,
  Eye,
  Calendar,
  ChevronDown,
  ChevronRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchema } from "@/lib/hooks";
import { SchemaMetadataDto } from "@/lib/types/database";
import { SchemaDetailsDialog } from "./schema-details-dialog";
import { cn } from "@/lib/utils";

interface SchemaCardProps {
  schema: Omit<SchemaMetadataDto, "tables" | "views">;
  className?: string;
}

export function SchemaCard({ schema, className }: SchemaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Only fetch detailed schema info when expanded
  const {
    data: detailedSchema,
    isLoading: detailsLoading,
    isError: detailsError,
  } = useSchema(schema.schemaName, { enabled: isExpanded });

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const tables = detailedSchema?.tables || [];
  const views = detailedSchema?.views || [];

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                schema.isSystemSchema
                  ? "bg-orange-50 dark:bg-orange-950/20"
                  : "bg-blue-50 dark:bg-blue-950/20"
              }`}
            >
              <Database
                className={`h-4 w-4 ${schema.isSystemSchema ? "text-orange-600" : "text-blue-600"}`}
              />
            </div>
            <CardTitle className="text-base">{schema.schemaName}</CardTitle>
            {schema.isSystemSchema ? (
              <Badge variant="secondary" className="text-xs mt-1">
                System
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs mt-1">
                User
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenDialog}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        {schema.creationDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Created {new Date(schema.creationDate).toLocaleDateString()}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto"
            onClick={handleToggleExpand}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Tables & Views</span>
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
                    Loading schema details...
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : detailsError ? (
                <div className="text-xs text-destructive p-2 bg-destructive/10 rounded">
                  Failed to load schema details.
                </div>
              ) : !detailedSchema ? (
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                  No detailed information available for this schema.
                </div>
              ) : (
                <>
                  {/* Tables Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Tables</span>
                      </div>
                      <Badge variant="outline">{tables.length}</Badge>
                    </div>
                    {tables.slice(0, 3).map(table => (
                      <div
                        key={table.tableName}
                        className="flex items-center justify-between text-xs"
                      >
                        <Link
                          href={`/database/tables/${schema.schemaName}/${table.tableName}`}
                          className="text-primary hover:underline"
                        >
                          {table.tableName}
                        </Link>
                        <span className="text-muted-foreground">
                          {table.rowCount?.toLocaleString() || 0} rows
                        </span>
                      </div>
                    ))}
                    {tables.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{tables.length - 3} more tables
                      </div>
                    )}
                    {tables.length === 0 && (
                      <div className="text-xs text-muted-foreground">No tables</div>
                    )}
                  </div>

                  {/* Views Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <View className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Views</span>
                      </div>
                      <Badge variant="outline">{views.length}</Badge>
                    </div>
                    {views.slice(0, 3).map(view => (
                      <div key={view.viewName} className="text-xs">
                        <Link
                          href={`/database/views/${schema.schemaName}/${view.viewName}`}
                          className="text-primary hover:underline"
                        >
                          {view.viewName}
                        </Link>
                      </div>
                    ))}
                    {views.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{views.length - 3} more views
                      </div>
                    )}
                    {views.length === 0 && (
                      <div className="text-xs text-muted-foreground">No views</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/database/schemas/${schema.schemaName}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Schema Details
            </Link>
          </Button>
        </div>
      </CardContent>

      <SchemaDetailsDialog schema={schema} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </Card>
  );
}
