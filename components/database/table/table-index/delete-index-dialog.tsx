"use client";

import { useState, useTransition } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { deleteIndex } from "@/lib/actions/database";
import { toast } from "sonner";
import { IndexMetadataDto } from "@/lib/types/database";

interface DeleteIndexDialogProps {
  index: IndexMetadataDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteIndexDialog({
  index,
  open,
  onOpenChange,
  onSuccess,
}: DeleteIndexDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteIndex(
          index.table.schema.schemaName,
          index.table.tableName,
          index.indexName
        );

        if (result.success) {
          toast.success(result.message || "Index deleted successfully");
          onSuccess();
          onOpenChange(false);
        } else {
          setError(result.message || "Failed to delete index");
        }
      } catch (err) {
        console.error("Failed to delete index:", err);
        setError("An unexpected error occurred while deleting the index");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Index</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the index &ldquo;{index.indexName}&rdquo;? This action
            cannot be undone and may affect query performance.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Deleting..." : "Delete Index"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
