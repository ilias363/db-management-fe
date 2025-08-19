import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BaseTableColumnMetadataDto } from "@/lib/types/database";
import { useRenameColumnForm } from "@/lib/hooks/use-column-edit";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common";

interface RenameColumnDialogProps {
  column: Omit<BaseTableColumnMetadataDto, "table">;
  schemaName: string;
  tableName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RenameColumnDialog({
  column,
  schemaName,
  tableName,
  open,
  onOpenChange,
  onSuccess,
}: RenameColumnDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const { form, isPending, submitError, submitRename, resetForm, isDirty, errors } =
    useRenameColumnForm({
      column,
      schemaName,
      tableName,
      onSuccess: () => {
        onSuccess?.();
        onOpenChange(false);
      },
      onError: (error: string) => toast.error(error),
    });

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleForceClose = () => {
    setShowUnsavedWarning(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
            <DialogDescription>
              Enter a new name for the column &ldquo;{column.columnName}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitRename)} className="space-y-4">
              {(errors.root?.message || submitError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.root?.message || submitError}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="newColumnName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Column Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter new column name" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !form.formState.isValid}>
                  {isPending ? "Renaming..." : "Rename"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close this dialog? All changes will be lost."
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        onConfirm={handleForceClose}
        confirmText="Discard Changes"
        cancelText="Continue Editing"
        variant="destructive"
      />
    </>
  );
}
