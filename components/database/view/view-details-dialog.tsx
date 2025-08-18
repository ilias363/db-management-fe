"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { View, Columns, Code } from "lucide-react";
import { useView } from "@/lib/hooks";

interface ViewDetailsDialogProps {
  schemaName: string;
  viewName: string;
  isSystemSchema: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewDetailsDialog({
  schemaName,
  viewName,
  isSystemSchema,
  open,
  onOpenChange,
}: ViewDetailsDialogProps) {
  const { data: view, isLoading, isError } = useView(schemaName, viewName, { enabled: open });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded flex items-center justify-center ${
                isSystemSchema
                  ? "bg-orange-50 dark:bg-orange-950/20"
                  : "bg-blue-50 dark:bg-blue-950/20"
              }`}
            >
              <View className={`h-5 w-5 ${isSystemSchema ? "text-orange-600" : "text-blue-600"}`} />
            </div>
            {viewName}
            <Badge variant="outline" className="text-xs">
              {schemaName}
            </Badge>
            {isSystemSchema && (
              <Badge variant="secondary" className="text-xs">
                System
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <View className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">Failed to Load View Details</h3>
            <p className="text-muted-foreground">
              There was an error loading the details for view &quot;{viewName}&quot;.
            </p>
          </div>
        ) : !view ? (
          <div className="text-center py-8">
            <View className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">View Not Found</h3>
            <p className="text-muted-foreground">
              The view &quot;{viewName}&quot; could not be found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Updatable:</span>
                  <Badge variant={view.isUpdatable ? "default" : "secondary"}>
                    {view.isUpdatable ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check Option:</span>
                  <Badge variant={view.checkOption ? "default" : "secondary"}>
                    {view.checkOption ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                {view.charachterSet && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Character Set:</span>
                    <span className="text-sm font-mono">{view.charachterSet}</span>
                  </div>
                )}
                {view.collation && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Collation:</span>
                    <span className="text-sm font-mono">{view.collation}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  View Definition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 max-w-[42rem] rounded border overflow-auto">
                  <div className="p-4">
                    <pre className="text-sm whitespace-pre-wrap text-muted-foreground font-mono leading-relaxed block overflow-hidden break-words max-w-full">
                      {view.viewDefinition}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Columns className="h-4 w-4" />
                  Columns ({view.columns?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {view.columns && view.columns.length > 0 ? (
                  <div className="h-64 w-full pr-2 overflow-auto">
                    <div className="space-y-2">
                      {view.columns.map((column, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{column.columnName}</span>
                            {column.isNullable === false && (
                              <Badge variant="secondary" className="text-xs">
                                NOT NULL
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {column.dataType}
                            {column.characterMaxLength && `(${column.characterMaxLength})`}
                            {column.columnDefault && (
                              <span className="ml-2">Default: {column.columnDefault}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Columns className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No columns defined</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
