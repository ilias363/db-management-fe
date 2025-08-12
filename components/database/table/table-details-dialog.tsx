"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, Columns, Hash, HardDrive, BarChart3 } from "lucide-react";
import { useTable } from "@/lib/hooks";
import { ColumnType } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

interface TableDetailsDialogProps {
  schemaName: string;
  tableName: string;
  isSystemSchema: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TableDetailsDialog({
  schemaName,
  tableName,
  isSystemSchema,
  open,
  onOpenChange,
}: TableDetailsDialogProps) {
  const { data: table, isLoading, isError } = useTable(schemaName, tableName, { enabled: open });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
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
            {tableName}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
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
            <Table className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">Failed to Load Table Details</h3>
            <p className="text-muted-foreground">
              There was an error loading the details for table &quot;{tableName}&quot;.
            </p>
          </div>
        ) : !table ? (
          <div className="text-center py-8">
            <Table className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">Table Not Found</h3>
            <p className="text-muted-foreground">
              The table &quot;{tableName}&quot; could not be found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Columns className="h-4 w-4" />
                    Columns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{table.columns?.length || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Rows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{table.rowCount?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {table.sizeInBytes ? formatBytes(table.sizeInBytes) : "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Columns className="h-4 w-4" />
                  Columns ({table.columns?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {table.columns && table.columns.length > 0 ? (
                  <div className="space-y-2">
                    {table.columns.map((column, i) => {
                      const isPrimaryKey =
                        column.columnType === ColumnType.PRIMARY_KEY ||
                        column.columnType === ColumnType.PRIMARY_KEY_FOREIGN_KEY;
                      const isForeignKey =
                        column.columnType === ColumnType.FOREIGN_KEY ||
                        column.columnType === ColumnType.PRIMARY_KEY_FOREIGN_KEY;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className={isPrimaryKey ? "font-medium text-primary" : ""}>
                              {column.columnName}
                            </span>
                            {isPrimaryKey && (
                              <Badge variant="outline" className="text-xs">
                                PK
                              </Badge>
                            )}
                            {isForeignKey && (
                              <Badge variant="outline" className="text-xs">
                                FK
                              </Badge>
                            )}
                            {column.isNullable === false && (
                              <Badge variant="secondary" className="text-xs">
                                NOT NULL
                              </Badge>
                            )}
                            {column.isUnique === true && (
                              <Badge variant="secondary" className="text-xs">
                                UNIQUE
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
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No columns defined</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Indexes ({table.indexes?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {table.indexes && table.indexes.length > 0 ? (
                  <div className="space-y-2">
                    {table.indexes.map((index, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <span>{index.indexName}</span>
                          {index.isUnique && (
                            <Badge variant="secondary" className="text-xs">
                              Unique
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{index.indexType}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No indexes defined</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
