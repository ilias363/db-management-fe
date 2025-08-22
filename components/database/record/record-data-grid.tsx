"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Settings2,
  Plus,
  X,
  Save,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnType, DataType, SortDirection } from "@/lib/types";
import { TableMetadataDto, TableRecordPageDto } from "@/lib/types/database";
import { TablePagination } from "@/components/common";
import { EditableRowCell } from "./editable-row-cell";
import { formatColumnType, renderCellValue } from "./utils";

interface TanstackTableRecord {
  id: string;
  data: Record<string, unknown>;
  originalRecord: Record<string, unknown>;
  isNewRecord?: boolean;
}

interface RecordDataGridProps {
  table?: TableMetadataDto;
  recordsData?: TableRecordPageDto;
  selectedRecords?: Record<string, unknown>[];
  onSelectionChange?: (records: Record<string, unknown>[]) => void;
  onSort: (columnName: string) => void;
  sortBy?: string;
  sortDirection: SortDirection;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  canEditRecords?: boolean;
  onEditRecord?: (record: Record<string, unknown>) => void;
  canDeleteRecords?: boolean;
  onDeleteRecord?: (record: Record<string, unknown>) => void;
  onDeleteSelectedRecords?: (records: Record<string, unknown>[]) => void;
  canCreateRecords?: boolean;
  onCreateRecords?: (records: Record<string, unknown>[]) => Promise<void>;
}

export function RecordDataGrid({
  table,
  recordsData,
  selectedRecords = [],
  onSelectionChange,
  onSort,
  sortBy,
  sortDirection,
  onPageChange,
  onPageSizeChange,
  canEditRecords = false,
  onEditRecord,
  canDeleteRecords = false,
  onDeleteRecord,
  onDeleteSelectedRecords,
  canCreateRecords = false,
  onCreateRecords,
}: RecordDataGridProps) {
  const records = useMemo(() => recordsData?.items || [], [recordsData?.items]);
  const totalPages = recordsData?.totalPages || 0;
  const totalElements = recordsData?.totalItems || 0;
  const page = recordsData?.currentPage || 0;
  const pageSize = recordsData?.pageSize || 10;

  const [newRecords, setNewRecords] = useState<{ id: string; data: Record<string, unknown> }[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Transform data for TanStack Table
  const tanstackTableData = useMemo<TanstackTableRecord[]>(() => {
    const existingRecords = records.map((record, index) => ({
      id: `row-${index}`,
      data: (record as { data?: Record<string, unknown> })?.data || {},
      originalRecord: record,
      isNewRecord: false,
    }));

    const newRecordRows = newRecords.map(newRecord => ({
      id: newRecord.id,
      data: newRecord.data,
      originalRecord: newRecord.data,
      isNewRecord: true,
    }));

    return [...newRecordRows, ...existingRecords];
  }, [records, newRecords]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Sync external sorting with internal state
  useEffect(() => {
    const newSorting: SortingState = sortBy
      ? [{ id: sortBy, desc: sortDirection === SortDirection.DESC }]
      : [];
    setSorting(newSorting);
  }, [sortBy, sortDirection]);

  // Sync external selection with internal state
  useEffect(() => {
    if (!onselectionchange || !selectedRecords) return;

    const newSelection: RowSelectionState = {};
    tanstackTableData.forEach((row, index) => {
      const isSelected = selectedRecords.some(
        selected => JSON.stringify(selected) === JSON.stringify(row.originalRecord)
      );
      if (isSelected) {
        newSelection[index] = true;
      }
    });
    setRowSelection(newSelection);
  }, [selectedRecords, tanstackTableData]);

  const addNewRecord = () => {
    if (!table?.columns) return;

    tableInstance.toggleAllColumnsVisible(true);

    const newRecordId = `new-${Date.now()}`;
    const emptyData: Record<string, unknown> = {};

    table.columns.forEach(column => {
      if (column.columnDefault !== null && column.columnDefault !== undefined) {
        emptyData[column.columnName] = column.columnDefault;
      } else if (!column.isNullable) {
        switch (column.dataType.toUpperCase() as DataType) {
          case (DataType.VARCHAR, DataType.TEXT, DataType.CHAR):
            emptyData[column.columnName] = "";
            break;
          case (DataType.INT,
          DataType.INTEGER,
          DataType.SMALLINT,
          DataType.BIGINT,
          DataType.DECIMAL,
          DataType.NUMERIC,
          DataType.FLOAT,
          DataType.REAL,
          DataType.DOUBLE):
            emptyData[column.columnName] = 0;
            break;
          case DataType.BOOLEAN:
            emptyData[column.columnName] = false;
            break;
          case (DataType.DATE, DataType.TIMESTAMP):
            emptyData[column.columnName] = new Date().toISOString().split("T")[0];
            break;
          case DataType.TIME:
            emptyData[column.columnName] = new Date().toISOString().split("T")[1].split("Z")[0];
            break;
          default:
            emptyData[column.columnName] = null;
        }
      } else {
        emptyData[column.columnName] = null;
      }
    });

    setNewRecords(prev => [...prev, { id: newRecordId, data: emptyData }]);
  };

  const updateNewRecord = useCallback((recordId: string, columnName: string, value: unknown) => {
    setNewRecords(prev =>
      prev.map(record =>
        record.id === recordId
          ? { ...record, data: { ...record.data, [columnName]: value } }
          : record
      )
    );
  }, []);

  const removeNewRecord = useCallback((recordId: string) => {
    setNewRecords(prev => prev.filter(record => record.id !== recordId));
  }, []);

  const saveNewRecords = async () => {
    if (!onCreateRecords || newRecords.length === 0) return;

    setIsCreating(true);
    try {
      const recordsToCreate = newRecords.map(record => record.data);
      await onCreateRecords(recordsToCreate);
      setNewRecords([]);
    } catch (error) {
      console.error("Failed to create records:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const getColumnIcon = (columnType: ColumnType) => {
    switch (columnType) {
      case ColumnType.PRIMARY_KEY:
        return (
          <Badge variant="secondary" className="text-xs">
            PK
          </Badge>
        );
      case ColumnType.FOREIGN_KEY:
        return (
          <Badge variant="outline" className="text-xs">
            FK
          </Badge>
        );
      case ColumnType.PRIMARY_KEY_FOREIGN_KEY:
        return (
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs">
              PK
            </Badge>
            <Badge variant="outline" className="text-xs">
              FK
            </Badge>
          </div>
        );
      default:
        return null;
    }
  };

  const columns = useMemo<ColumnDef<TanstackTableRecord>[]>(() => {
    if (!table?.columns) return [];

    const columnDefs: ColumnDef<TanstackTableRecord>[] = [];

    if (onSelectionChange) {
      columnDefs.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        cell: ({ row }) => {
          if (row.original.isNewRecord) {
            return null;
          }
          return (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={value => row.toggleSelected(!!value)}
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      });
    }

    // Data columns
    columnDefs.push(
      ...table.columns.map((column): ColumnDef<TanstackTableRecord> => {
        const isPrimaryKey =
          column.columnType === ColumnType.PRIMARY_KEY ||
          column.columnType === ColumnType.PRIMARY_KEY_FOREIGN_KEY;

        return {
          id: column.columnName,
          accessorFn: row => row.data[column.columnName],
          header: ({ column: tanstackColumn }) => {
            const isSorted = tanstackColumn.getIsSorted();
            return (
              <div className="flex flex-col gap-0 py-1">
                <div className="flex items-center pl-0 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium cursor-pointer hover:bg-transparent"
                    onClick={() => tanstackColumn.toggleSorting()}
                  >
                    <div className="flex items-start justify-center gap-1">
                      <span className="truncate max-w-[150px]">{column.columnName}</span>
                      {getColumnIcon(column.columnType)}
                      {isSorted === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : isSorted === "desc" ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                  <span>{formatColumnType(column)}</span>
                  <div className="flex items-center gap-1">
                    {!column.isNullable && (
                      <span
                        className="dark:text-red-500 text-red-600 font-semibold"
                        title="Not Nullable"
                      >
                        *
                      </span>
                    )}
                    {column.isUnique && (
                      <span
                        className="dark:text-blue-500 text-blue-600 font-semibold"
                        title="Unique"
                      >
                        U
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          },
          cell: ({ getValue, row }) => {
            const value = getValue();

            if (row.original.isNewRecord) {
              return (
                <EditableRowCell
                  recordId={row.original.id}
                  value={value}
                  column={column}
                  onUpdate={updateNewRecord}
                />
              );
            }

            return (
              <span
                className={`max-w-xs truncate block${isPrimaryKey ? " font-medium" : ""}${
                  value === null ? " text-muted-foreground italic" : ""
                }`}
                title={renderCellValue(value)}
              >
                {renderCellValue(value)}
              </span>
            );
          },
        };
      })
    );

    if ((canEditRecords && onEditRecord) || (canDeleteRecords && onDeleteRecord)) {
      columnDefs.push({
        id: "actions",
        header: () => <span className="flex items-center justify-end mr-4">Actions</span>,
        cell: ({ row }) => {
          const record = row.original;

          if (record.isNewRecord) {
            return (
              <div className="flex items-center justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeNewRecord(record.id)}
                  title="Remove new record"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-end gap-1">
              {canEditRecords && onEditRecord && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditRecord(row.original.originalRecord)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {canDeleteRecords && onDeleteRecord && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteRecord(row.original.originalRecord)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      });
    }

    return columnDefs;
  }, [
    table?.columns,
    onSelectionChange,
    canEditRecords,
    onEditRecord,
    canDeleteRecords,
    onDeleteRecord,
    updateNewRecord,
    removeNewRecord,
  ]);

  const tableInstance = useReactTable({
    data: tanstackTableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    manualPagination: true,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: updater => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);

      if (newSorting.length > 0) {
        const sort = newSorting[0];
        onSort(sort.id);
      }
    },
    onRowSelectionChange: updater => {
      if (!onSelectionChange) return;

      const newRowSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newRowSelection);

      const selectedIds = Object.keys(newRowSelection).filter(id => newRowSelection[id]);
      const selectedOriginalRecords = selectedIds
        .map(id => tanstackTableData[parseInt(id)])
        .filter(record => !record.isNewRecord)
        .map(record => record.originalRecord);

      onSelectionChange(selectedOriginalRecords);
    },
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: !!onSelectionChange,
    enableMultiRowSelection: !!onSelectionChange,
    enableHiding: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-1 px-1">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns Visibility
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tableInstance
                .getAllColumns()
                .filter(column => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map(column => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={value => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {canCreateRecords && onCreateRecords && (
            <>
              {newRecords.length === 0 ? (
                <Button size="sm" onClick={addNewRecord} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Record
                </Button>
              ) : (
                <Button size="sm" onClick={addNewRecord} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Another
                </Button>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {newRecords.length > 0 && (
            <Button size="sm" onClick={saveNewRecords} disabled={isCreating} className="gap-2">
              <Save className="h-4 w-4" />
              {isCreating
                ? "Saving..."
                : `Save ${newRecords.length} Record${newRecords.length > 1 ? "s" : ""}`}
            </Button>
          )}
          {canDeleteRecords && selectedRecords.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDeleteSelectedRecords?.(selectedRecords)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-md">
        {tableInstance.getRowModel().rows.length === 0 ? (
          <div className="text-center text-muted-foreground py-36">
            <p>No records found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              {tableInstance.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} className="min-w-[40px]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {tableInstance.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  className={`${row.getIsSelected() ? "bg-muted/50" : ""} ${
                    row.original.isNewRecord ? "bg-blue-50 dark:bg-blue-950/20" : ""
                  }`}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalElements}
        pageSize={pageSize}
        onPageChange={onPageChange}
        pageSizes={[10, 25, 50, 100]}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
