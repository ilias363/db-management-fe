import { ColumnDef, DataTable } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { ViewMetadataDto, ViewColumnDto } from "@/lib/types/database";
import { Columns } from "lucide-react";

interface ViewColumnTableProps {
  view: ViewMetadataDto;
}

export function ViewColumnTable({ view }: ViewColumnTableProps) {
  const columnDefinitions: ColumnDef<Omit<ViewColumnDto, "view">>[] = [
    {
      key: "columnName",
      title: "Name",
      render: column => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{column.columnName}</span>
        </div>
      ),
    },
    {
      key: "dataType",
      title: "Data Type",
      render: column => (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{column.dataType}</Badge>
          {column.characterMaxLength && (
            <span className="text-xs text-muted-foreground">({column.characterMaxLength})</span>
          )}
        </div>
      ),
    },
    {
      key: "constraints",
      title: "Constraints",
      render: column => (
        <div className="flex flex-wrap gap-1">
          {column.isNullable === false && (
            <Badge variant="outline" className="text-xs">
              NOT NULL
            </Badge>
          )}
          {column.isUnique && (
            <Badge variant="outline" className="text-xs">
              UNIQUE
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

  return (
    <DataTable<Omit<ViewColumnDto, "view">>
      data={view.columns || []}
      columns={columnDefinitions}
      getRowKey={column => column.columnName}
      emptyStateIcon={<Columns className="w-12 h-12 text-muted-foreground opacity-50" />}
      emptyStateTitle="No columns found"
      emptyStateDescription="This view has no columns defined."
    />
  );
}
