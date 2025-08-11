import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import { TablePagination } from "@/components/common";

export interface ColumnDef<T> {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface ActionButton<T> {
  label: string | ((item: T) => string);
  icon?: React.ReactNode | ((item: T) => React.ReactNode);
  onClick: (item: T) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: ActionButton<T>[];
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  onSort?: (field: string) => void;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  getRowKey: (item: T) => string | number;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  actions = [],
  searchTerm,
  sortBy,
  sortDirection,
  onSort,
  currentPage = 0,
  pageSize = 10,
  totalItems = 0,
  onPageChange = () => {},
  emptyStateIcon,
  emptyStateTitle = "No data found",
  emptyStateDescription,
  getRowKey,
  className,
}: DataTableProps<T>) {
  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => {
    const isSorted = sortBy === field;
    const isAsc = isSorted && sortDirection === "ASC";

    return (
      <div
        className="cursor-pointer inline-flex items-center hover:text-foreground transition-colors"
        onClick={() => onSort?.(field)}
      >
        {children}
        {isSorted ? (
          isAsc ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        )}
      </div>
    );
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const hasActions = actions.length > 0;

  return (
    <>
      <div className={`rounded-md border ${className || ""}`}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead
                  key={column.key}
                  className={`text-muted-foreground ${column.className || ""}`}
                >
                  {column.sortable && onSort ? (
                    <SortableHeader field={column.key}>{column.title}</SortableHeader>
                  ) : (
                    column.title
                  )}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="text-center text-muted-foreground">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(item => (
              <TableRow key={getRowKey(item)}>
                {columns.map(column => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render
                      ? column.render(item)
                      : String((item as Record<string, unknown>)[column.key] || "")}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell align="center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions
                          .filter(action => !action.hidden?.(item))
                          .map((action, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => action.onClick(item)}
                              disabled={action.disabled?.(item)}
                              className={`cursor-pointer ${action.className || ""} ${
                                action.variant === "destructive"
                                  ? "text-destructive focus:text-destructive"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {typeof action.icon === "function"
                                  ? action.icon(item)
                                  : action.icon}
                                <span>
                                  {typeof action.label === "function"
                                    ? action.label(item)
                                    : action.label}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="text-center py-8"
                >
                  {emptyStateIcon && (
                    <div className="flex justify-center mb-4">{emptyStateIcon}</div>
                  )}
                  <p className="text-muted-foreground font-medium">{emptyStateTitle}</p>
                  {emptyStateDescription && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {searchTerm
                        ? `No results found for "${searchTerm}". ${emptyStateDescription}`
                        : emptyStateDescription}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </>
  );
}
