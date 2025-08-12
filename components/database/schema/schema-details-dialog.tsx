"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Table, View, Calendar, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSchema } from "@/lib/hooks";
import { SchemaMetadataDto } from "@/lib/types/database";

interface SchemaDetailsDialogProps {
  schema: Omit<SchemaMetadataDto, "tables" | "views">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SchemaDetailsDialog({ schema, open, onOpenChange }: SchemaDetailsDialogProps) {
  const {
    data: detailedSchema,
    isLoading,
    isError,
  } = useSchema(schema.schemaName, { enabled: open });

  const tables = detailedSchema?.tables || [];
  const views = detailedSchema?.views || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                schema.isSystemSchema
                  ? "bg-orange-50 dark:bg-orange-950/20"
                  : "bg-blue-50 dark:bg-blue-950/20"
              }`}
            >
              <Database
                className={`h-5 w-5 ${schema.isSystemSchema ? "text-orange-600" : "text-blue-600"}`}
              />
            </div>
            <span className="truncate" title={schema.schemaName}>
              {schema.schemaName}
            </span>
            {schema.isSystemSchema ? (
              <Badge variant="secondary" className="text-xs">
                System
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                User
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Detailed information about the {schema.schemaName} schema
            {schema.creationDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Calendar className="h-3 w-3" />
                Created {new Date(schema.creationDate).toLocaleDateString()}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading schema details...
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-lg">
                Failed to load schema details.
              </div>
            </div>
          ) : !detailedSchema ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground text-sm p-4 bg-muted/50 rounded-lg">
                No detailed information available for this schema.
              </div>
            </div>
          ) : (
            <>
              {/* Tables Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Tables</h3>
                  </div>
                  <Badge variant="outline">{tables.length}</Badge>
                </div>

                {tables.length > 0 ? (
                  <div className="grid gap-2 max-h-56 overflow-y-auto pr-2">
                    {tables.map(table => (
                      <div
                        key={table.tableName}
                        className="flex items-center justify-between p-2 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Table className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Link
                            href={`/database/tables/${schema.schemaName}/${table.tableName}`}
                            className="text-primary hover:underline font-medium truncate"
                            title={table.tableName}
                          >
                            {table.tableName}
                          </Link>
                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {table.rowCount?.toLocaleString() || 0} rows
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm bg-muted/30 rounded-lg">
                    No tables found in this schema
                  </div>
                )}
              </div>

              {/* Views Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <View className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Views</h3>
                  </div>
                  <Badge variant="outline">{views.length}</Badge>
                </div>

                {views.length > 0 ? (
                  <div className="grid gap-2 max-h-56 overflow-y-auto pr-2">
                    {views.map(view => (
                      <div
                        key={view.viewName}
                        className="flex items-center justify-between p-2 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <View className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Link
                            href={`/database/views/${schema.schemaName}/${view.viewName}`}
                            className="text-primary hover:underline font-medium truncate"
                            title={view.viewName}
                          >
                            {view.viewName}
                          </Link>
                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-sm bg-muted/30 rounded-lg">
                    No views found in this schema
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
