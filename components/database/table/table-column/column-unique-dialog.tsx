"use client";

import { BaseTableColumnMetadataDto } from "@/lib/types/database";
import { useUpdateColumnUniqueForm } from "@/lib/hooks/use-column-edit";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ColumnType } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ColumnUniqueDialogProps {
  column: Omit<BaseTableColumnMetadataDto, "table">;
  schemaName: string;
  tableName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ColumnUniqueDialog({
  column,
  schemaName,
  tableName,
  open,
  onOpenChange,
  onSuccess,
}: ColumnUniqueDialogProps) {
  const { isPending, submitUniqueToggle } = useUpdateColumnUniqueForm({
    column,
    schemaName,
    tableName,
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: string) => toast.error(error),
  });

  const canToggle = column.columnType == ColumnType.STANDARD;

  const handleToggle = async () => {
    if (!canToggle) return;
    await submitUniqueToggle(!column.isUnique);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Unique Constraint</AlertDialogTitle>
          <AlertDialogDescription>{`Are you sure you want to ${
            column.isUnique ? "remove" : "add"
          } the unique constraint for
              column &quot;{column.columnName}&quot;?`}</AlertDialogDescription>
        </AlertDialogHeader>

        {!canToggle && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unique constraint is only applicable to standard columns.
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
            {isPending ? "Updating..." : "Confirm"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
