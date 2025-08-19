import { ActionButton, ColumnDef, DataTable } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { ColumnType } from "@/lib/types";
import { BaseTableColumnMetadataDto, TableMetadataDto } from "@/lib/types/database";
import { Columns, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ColumnTableProps {
  table: TableMetadataDto;
  canModify: boolean;
  canDelete: boolean;
  onDeleteColumn?: (column: Omit<BaseTableColumnMetadataDto, "table">) => void;
}

export function ColumnTable({ table, canModify, canDelete, onDeleteColumn }: ColumnTableProps) {
  const getColumnTypeBadgeVariant = (columnType: ColumnType) => {
    switch (columnType) {
      case ColumnType.PRIMARY_KEY:
        return "destructive" as const;
      case ColumnType.FOREIGN_KEY:
        return "secondary" as const;
      case ColumnType.PRIMARY_KEY_FOREIGN_KEY:
        return "default" as const;
      default:
        return "outline" as const;
    }
  };

  const isSystemSchema = table.schema.isSystemSchema;

  const columnDefinitions: ColumnDef<Omit<BaseTableColumnMetadataDto, "table">>[] = [
    {
      key: "columnName",
      title: "Name",
      render: column => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{column.columnName}</span>
          {column.columnType === ColumnType.PRIMARY_KEY && (
            <Badge variant="destructive" className="text-xs">
              PK
            </Badge>
          )}
          {column.columnType === ColumnType.FOREIGN_KEY && (
            <Badge variant="secondary" className="text-xs">
              FK
            </Badge>
          )}
          {column.columnType === ColumnType.PRIMARY_KEY_FOREIGN_KEY && (
            <Badge variant="default" className="text-xs">
              PK+FK
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "dataType",
      title: "Data Type",
      render: column => (
        <div className="flex items-center gap-2">
          <Badge variant={getColumnTypeBadgeVariant(column.columnType)}>{column.dataType}</Badge>
          {column.characterMaxLength && (
            <span className="text-xs text-muted-foreground">({column.characterMaxLength})</span>
          )}
          {column.numericPrecision && (
            <span className="text-xs text-muted-foreground">
              ({column.numericPrecision}
              {column.numericScale !== undefined ? `,${column.numericScale}` : ""})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "constraints",
      title: "Constraints",
      render: column => (
        <div className="flex flex-wrap gap-1">
          {!column.isNullable && (
            <Badge variant="outline" className="text-xs">
              NOT NULL
            </Badge>
          )}
          {column.isUnique && (
            <Badge variant="outline" className="text-xs">
              UNIQUE
            </Badge>
          )}
          {column.autoIncrement && (
            <Badge variant="outline" className="text-xs">
              AUTO INCREMENT
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "columnDefault",
      title: "Default",
      render: column =>
        column.columnDefault ? (
          <span className="text-sm text-muted-foreground">{column.columnDefault}</span>
        ) : (
          <span className="text-sm text-muted-foreground italic">null</span>
        ),
    },
    {
      key: "ordinalPosition",
      title: "Position",
      render: column => (
        <span className="text-sm text-muted-foreground">#{column.ordinalPosition}</span>
      ),
      className: "w-20",
    },
  ];

  const hasFkColumns = table.columns?.some(column =>
    [ColumnType.FOREIGN_KEY, ColumnType.PRIMARY_KEY_FOREIGN_KEY].includes(column.columnType)
  );

  if (hasFkColumns) {
    columnDefinitions.push({
      key: "referencedColumnName",
      title: "Referenced Column",
      render: column => (
        <span className="text-sm text-muted-foreground">
          {"referencedSchemaName" in column &&
          "referencedTableName" in column &&
          "referencedColumnName" in column ? (
            <p>
              <Link
                href={`/database/tables/${column.referencedSchemaName}/${column.referencedTableName}`}
                className="underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                {`${column.referencedSchemaName}.${column.referencedTableName}`}
              </Link>
              {`(${column.referencedColumnName})`}
            </p>
          ) : (
            "N/A"
          )}
        </span>
      ),
    });
  }

  const columnActions: ActionButton<Omit<BaseTableColumnMetadataDto, "table">>[] = [
    {
      label: "Edit Column",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => toast.info("To be implemented"),
      variant: "ghost",
      disabled: () => !canModify || isSystemSchema,
    },
    {
      label: "Delete Column",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: column => onDeleteColumn?.(column),
      variant: "destructive",
      disabled: () => !canDelete || isSystemSchema,
    },
  ];

  return (
    <DataTable<Omit<BaseTableColumnMetadataDto, "table">>
      data={table.columns || []}
      columns={columnDefinitions}
      actions={columnActions}
      getRowKey={column => column.columnName}
      emptyStateIcon={<Columns className="w-12 h-12 text-muted-foreground opacity-50" />}
      emptyStateTitle="No columns found"
      emptyStateDescription="This table has no columns defined."
    />
  );
}
