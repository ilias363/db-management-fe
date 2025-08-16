import { ActionButton, ColumnDef, DataTable } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { IndexMetadataDto, TableMetadataDto } from "@/lib/types/database";
import { BarChart3, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface IndexTableProps {
  table: TableMetadataDto;
  canDelete: boolean;
}

export function IndexTable({ table, canDelete }: IndexTableProps) {
  const isSystemSchema = table.schema.isSystemSchema;

  const indexDefinitions: ColumnDef<Omit<IndexMetadataDto, "table">>[] = [
    {
      key: "indexName",
      title: "Index Name",
      render: index => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{index.indexName}</span>
          {index.isUnique && (
            <Badge variant="secondary" className="text-xs">
              UNIQUE
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "indexType",
      title: "Type",
      render: index => (
        <Badge variant="outline" className="text-xs">
          {index.indexType}
        </Badge>
      ),
    },
    {
      key: "indexColumns",
      title: "Columns",
      render: index => (
        <div className="text-sm text-muted-foreground">
          {index.indexColumns?.map(col => col.columnName).join(", ") || "N/A"}
        </div>
      ),
    },
    {
      key: "isUnique",
      title: "Unique",
      render: index => (
        <Badge variant={index.isUnique ? "default" : "outline"} className="text-xs">
          {index.isUnique ? "YES" : "NO"}
        </Badge>
      ),
      className: "w-20",
    },
  ];

  const indexActions: ActionButton<Omit<IndexMetadataDto, "table">>[] = [
    {
      label: "Delete Index",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => toast.info("To be implemented"),
      variant: "destructive",
      disabled: () => !canDelete || isSystemSchema,
    },
  ];

  return (
    <DataTable<Omit<IndexMetadataDto, "table">>
      data={table.indexes || []}
      columns={indexDefinitions}
      actions={indexActions}
      getRowKey={index => index.indexName}
      emptyStateIcon={<BarChart3 className="w-12 h-12 text-muted-foreground opacity-50" />}
      emptyStateTitle="No indexes found"
      emptyStateDescription="This table has no indexes defined."
    />
  );
}
