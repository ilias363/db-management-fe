"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  Columns,
  BarChart3,
  Eye,
  ChevronDown,
  ChevronRight,
  Loader2,
  ExternalLink,
  Hash,
  HardDrive,
  Database,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useTable } from "@/lib/hooks";
import { ColumnType } from "@/lib/types";
import { TableDetailsDialog } from "@/components/database";
import { cn, formatBytes } from "@/lib/utils";

interface TableCardProps {
  schemaName: string;
  tableName: string;
  isSystemSchema: boolean;
  className?: string;
}

export function TableCard({ schemaName, tableName, isSystemSchema, className }: TableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: detailedTable,
    isLoading: detailsLoading,
    isError: detailsError,
  } = useTable(schemaName, tableName, { enabled: isExpanded });

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSystemSchema
                  ? "bg-orange-50 dark:bg-orange-950/20"
                  : "bg-purple-50 dark:bg-purple-950/20"
              }`}
            >
              <Table
                className={`h-4 w-4 ${isSystemSchema ? "text-orange-600" : "text-purple-600"}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{tableName}</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Database className="h-3 w-3" />
                {schemaName}
                {isSystemSchema && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    System
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
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
              <span className="text-sm font-medium">Table Details</span>
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
                    Loading table details...
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : detailsError ? (
                <div className="text-xs text-destructive p-2 bg-destructive/10 rounded">
                  Failed to load table details.
                </div>
              ) : !detailedTable ? (
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                  No detailed information available for this table.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Columns className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="text-sm font-medium">
                        {detailedTable.columns?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Columns</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="text-sm font-medium">
                        {detailedTable.rowCount?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Rows</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <HardDrive className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="text-sm font-medium">
                        {detailedTable.sizeInBytes ? formatBytes(detailedTable.sizeInBytes) : "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">Size</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Columns className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Columns</span>
                      </div>
                      <Badge variant="outline">{detailedTable.columns?.length || 0}</Badge>
                    </div>
                    {detailedTable.columns && detailedTable.columns.length > 0 ? (
                      <>
                        {detailedTable.columns.slice(0, 4).map((column, i) => {
                          const isPrimaryKey =
                            column.columnType === ColumnType.PRIMARY_KEY ||
                            column.columnType === ColumnType.PRIMARY_KEY_FOREIGN_KEY;
                          const isForeignKey =
                            column.columnType === ColumnType.FOREIGN_KEY ||
                            column.columnType === ColumnType.PRIMARY_KEY_FOREIGN_KEY;
                          return (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className={isPrimaryKey ? "font-medium text-primary" : ""}>
                                {column.columnName}
                                {isPrimaryKey && (
                                  <Badge variant="outline" className="ml-1 text-xs">
                                    PK
                                  </Badge>
                                )}
                                {isForeignKey && (
                                  <Badge variant="outline" className="ml-1 text-xs">
                                    FK
                                  </Badge>
                                )}
                              </span>
                              <span className="text-muted-foreground">
                                {column.dataType}
                                {column.characterMaxLength && `(${column.characterMaxLength})`}
                              </span>
                            </div>
                          );
                        })}
                        {detailedTable.columns.length > 4 && (
                          <div className="text-xs text-muted-foreground">
                            +{detailedTable.columns.length - 4} more columns
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground">No columns</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Indexes</span>
                      </div>
                      <Badge variant="outline">{detailedTable.indexes?.length || 0}</Badge>
                    </div>
                    {detailedTable.indexes && detailedTable.indexes.length > 0 ? (
                      <>
                        {detailedTable.indexes.slice(0, 3).map((index, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span>{index.indexName}</span>
                            {index.isUnique && (
                              <Badge variant="secondary" className="text-xs">
                                Unique
                              </Badge>
                            )}
                          </div>
                        ))}
                        {detailedTable.indexes.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{detailedTable.indexes.length - 3} more indexes
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground">No indexes</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t space-y-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/database/tables/${schemaName}/${tableName}/data`}>
              <BarChart3 className="h-4 w-4 mr-2 rotate-90" />
              Browse Table Data
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/database/tables/${schemaName}/${tableName}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Table Details
            </Link>
          </Button>
        </div>
      </CardContent>

      <TableDetailsDialog
        schemaName={schemaName}
        tableName={tableName}
        isSystemSchema={isSystemSchema}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </Card>
  );
}
