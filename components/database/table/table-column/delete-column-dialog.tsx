"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { deleteColumn } from "@/lib/actions/database/column";
import { BaseTableColumnMetadataDto } from "@/lib/types/database";
import { ColumnType } from "@/lib/types";

interface DeleteColumnDialogProps {
  column: Omit<BaseTableColumnMetadataDto, "table">;
  schemaName: string;
  tableName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteColumnDialog({
  column,
  schemaName,
  tableName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteColumnDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [force, setForce] = useState(false);

  const isPrimaryKey =
    column.columnType === ColumnType.PRIMARY_KEY ||
    column.columnType === ColumnType.PRIMARY_KEY_FOREIGN_KEY;

  const isForeignKey =
    column.columnType === ColumnType.FOREIGN_KEY ||
    column.columnType === ColumnType.PRIMARY_KEY_FOREIGN_KEY;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteColumn(schemaName, tableName, column.columnName, force);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred while deleting the column");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isDeleting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setForce(false);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Column
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Are you sure you want to delete the column{" "}
            <span className="font-semibold text-foreground">
              {schemaName}.{tableName}.{column.columnName}
            </span>
            ? This action cannot be undone and will permanently remove all data in this column.
          </AlertDialogDescription>

          {(isPrimaryKey || isForeignKey) && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="force-delete-column"
                  checked={force}
                  onCheckedChange={checked => setForce(checked as boolean)}
                  disabled={isDeleting}
                />
                <label
                  htmlFor="force-delete-column"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Force delete (remove constraints first)
                </label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                {isPrimaryKey && isForeignKey
                  ? "This column is both a primary key and used in foreign key relationships. Use force delete to automatically remove these constraints before deleting the column."
                  : isPrimaryKey
                  ? "This column is a primary key. Use force delete to automatically remove the primary key constraint before deleting the column."
                  : "This column is used in foreign key relationships. Use force delete to automatically remove foreign key constraints before deleting the column."}
              </p>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Column"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
