"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRenameTableForm } from "@/lib/hooks";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TableMetadataDto } from "@/lib/types/database";
import { ConfirmDialog } from "@/components/common";

interface RenameTableDialogProps {
  table: TableMetadataDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (table: TableMetadataDto) => void;
}

export function RenameTableDialog({
  table,
  open,
  onOpenChange,
  onSuccess,
}: RenameTableDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const { form, isPending, submitError, submitTable, resetForm, isDirty, errors } =
    useRenameTableForm({
      table: table,
      onSuccess: table => {
        onOpenChange(false);
        onSuccess(table);
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Rename Table</DialogTitle>
            <DialogDescription>
              Enter a new name for the table &ldquo;{table.tableName}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitTable)} className="space-y-6">
              {(errors.root?.message || submitError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.root?.message || submitError}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="updatedTableName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Table Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter new table name"
                        disabled={isPending}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Table name must start with a letter and contain only letters, numbers, and
                      underscores.
                    </p>
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Renaming..." : "Rename Table"}
                </Button>
              </DialogFooter>
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
