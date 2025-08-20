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
import { useMemo, useState, useEffect } from "react";
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
import { Edit, Trash2, ArrowUp, ArrowDown, ArrowUpDown, Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnType, SortDirection } from "@/lib/types";
import {
  BaseTableColumnMetadataDto,
  TableMetadataDto,
  TableRecordPageDto,
} from "@/lib/types/database";
import { TablePagination } from "@/components/common";

interface TanstackTableRecord {
  id: string;
  data: Record<string, unknown>;
  originalRecord: Record<string, unknown>;
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
  onEditRecord?: (record: Record<string, unknown>) => void;
  onDeleteRecord?: (record: Record<string, unknown>) => void;
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
  onEditRecord,
  onDeleteRecord,
}: RecordDataGridProps) {
  const records = useMemo(() => recordsData?.items || [], [recordsData?.items]);
  const totalPages = recordsData?.totalPages || 0;
  const totalElements = recordsData?.totalItems || 0;
  const page = recordsData?.currentPage || 0;
  const pageSize = recordsData?.pageSize || 10;

  // Transform data for TanStack Table
  const data = useMemo<TanstackTableRecord[]>(() => {
    return records.map((record, index) => ({
      id: `row-${index}`,
      data: (record as { data?: Record<string, unknown> })?.data || {},
      originalRecord: record,
    }));
  }, [records]);

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
    data.forEach((row, index) => {
      const isSelected = selectedRecords.some(
        selected => JSON.stringify(selected) === JSON.stringify(row.originalRecord)
      );
      if (isSelected) {
        newSelection[index] = true;
      }
    });
    setRowSelection(newSelection);
  }, [selectedRecords, data]);

  const renderCellValue = (value: unknown): string => {
    if (value === null) return "NULL";
    if (value === undefined) return "";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const formatColumnType = (column: Omit<BaseTableColumnMetadataDto, "table">) => {
    let type = column.dataType.toUpperCase();
    if (column.characterMaxLength) {
      type += `(${column.characterMaxLength})`;
    } else if (column.numericPrecision) {
      type += `(${column.numericPrecision}${
        column.numericScale ? `, ${column.numericScale}` : ""
      })`;
    }
    return type;
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
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
          />
        ),
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
          cell: ({ getValue }) => {
            const value = getValue();
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

    if (onEditRecord && onDeleteRecord) {
      columnDefs.push({
        id: "actions",
        header: () => <span className="flex items-center justify-end mr-4">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditRecord(row.original.originalRecord)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteRecord(row.original.originalRecord)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    return columnDefs;
  }, [table?.columns, onEditRecord, onDeleteRecord, onSelectionChange]);

  const tableInstance = useReactTable({
    data,
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
        .map(id => data[parseInt(id)]?.originalRecord)
        .filter(Boolean);

      onSelectionChange(selectedOriginalRecords);
    },
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: !!onSelectionChange,
    enableMultiRowSelection: !!onSelectionChange,
    enableHiding: true,
  });

  if (!table?.columns || records.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>No records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="mt-1">
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

      <div className="border rounded-md">
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
                className={row.getIsSelected() ? "bg-muted/50" : ""}
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
