import React from "react";
import { AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BaseTableColumnMetadataDto } from "@/lib/types/database";
import { useUpdateColumnAutoIncrementForm } from "@/lib/hooks/use-column-edit";
import { DataType, ColumnType } from "@/lib/types";
import { toast } from "sonner";

const AUTO_INCREMENT_COMPATIBLE_TYPES = [
  DataType.INT,
  DataType.INTEGER,
  DataType.SMALLINT,
  DataType.BIGINT,
];

interface AutoIncrementColumnDialogProps {
  column: Omit<BaseTableColumnMetadataDto, "table">;
  schemaName: string;
  tableName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AutoIncrementColumnDialog({
  column,
  schemaName,
  tableName,
  open,
  onOpenChange,
  onSuccess,
}: AutoIncrementColumnDialogProps) {
  const { isPending, submitAutoIncrementToggle } = useUpdateColumnAutoIncrementForm({
    column,
    schemaName,
    tableName,
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: string) => toast.error(error),
  });

  const isCompatible = AUTO_INCREMENT_COMPATIBLE_TYPES.includes(column.dataType);
  const isPrimaryKey = [ColumnType.PRIMARY_KEY, ColumnType.PRIMARY_KEY_FOREIGN_KEY].includes(
    column.columnType
  );
  const canToggle = isCompatible && isPrimaryKey;

  const handleToggle = async () => {
    if (!canToggle) return;
    await submitAutoIncrementToggle(!column.autoIncrement);
  };

  const getDescription = () => {
    if (column.autoIncrement) {
      return `Are you sure you want to disable auto-increment for column "${column.columnName}"? This will remove automatic value generation.`;
    } else {
      return `Are you sure you want to enable auto-increment for column "${column.columnName}"? This will automatically generate sequential values.`;
    }
  };

  const getButtonText = () => {
    if (isPending) {
      return column.autoIncrement ? "Disabling..." : "Enabling...";
    }
    return column.autoIncrement ? "Disable Auto-Increment" : "Enable Auto-Increment";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {column.autoIncrement ? "Disable" : "Enable"} Auto-Increment
          </AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>

        {!canToggle && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {!isPrimaryKey
                ? "Auto-increment is only available for primary key columns."
                : "Auto-increment is only compatible with INT, INTEGER, SMALLINT, and BIGINT data types."}
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={column.autoIncrement ? "destructive" : "default"}
            onClick={handleToggle}
            disabled={isPending || !canToggle}
          >
            {getButtonText()}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
