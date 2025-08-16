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

import { deleteTable } from "@/lib/actions/database/table";
import { TableMetadataDto } from "@/lib/types/database";

interface DeleteTableDialogProps {
  table: TableMetadataDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteTableDialog({
  table,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTableDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [force, setForce] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteTable(table.schema.schemaName, table.tableName, force);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred while deleting the table");
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
            Delete Table
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Are you sure you want to delete the table{" "}
            <span className="font-semibold text-foreground">
              {table.schema.schemaName}.{table.tableName}
            </span>
            ? This action cannot be undone and will permanently remove all data and structure.
          </AlertDialogDescription>

          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="force-delete"
                checked={force}
                onCheckedChange={checked => setForce(checked as boolean)}
                disabled={isDeleting}
              />
              <label
                htmlFor="force-delete"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Force delete (drop foreign key constraints first)
              </label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Use this option if the table has foreign key relationships that prevent deletion. This
              will automatically drop foreign key constraints before deleting the table.
            </p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Table"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
