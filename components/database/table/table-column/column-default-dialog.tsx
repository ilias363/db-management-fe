"use client";

import { useEffect, useState } from "react";
import { BaseTableColumnMetadataDto } from "@/lib/types/database";
import { useUpdateColumnDefaultForm } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ConfirmDialog } from "@/components/common";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getCompatibleDefaultValuePattern } from "@/lib/schemas/database";
import { DataType } from "@/lib/types";

interface ColumnDefaultDialogProps {
  column: Omit<BaseTableColumnMetadataDto, "table">;
  schemaName: string;
  tableName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ColumnDefaultDialog({
  column,
  schemaName,
  tableName,
  open,
  onOpenChange,
  onSuccess,
}: ColumnDefaultDialogProps) {
  column.dataType =
    column.dataType.toUpperCase() === "TINYINT"
      ? DataType.BOOLEAN
      : (column.dataType.toUpperCase() as DataType);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const { form, isPending, submitError, submitDefaultUpdate, resetForm, isDirty, errors } =
    useUpdateColumnDefaultForm({
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Column Default Value</DialogTitle>
            <DialogDescription>
              Change the default value for column &quot;{column.columnName}&quot; ({column.dataType}
              ) in {schemaName}.{tableName}.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitDefaultUpdate)} className="space-y-4">
              {(errors.root?.message || submitError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.root?.message || submitError}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="columnDefault"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Value</FormLabel>
                    <FormControl>
                      <Input
                        type={
                          column.dataType.toUpperCase() == DataType.DATE
                            ? "date"
                            : column.dataType.toUpperCase() == DataType.TIME
                            ? "time"
                            : column.dataType.toUpperCase() == DataType.TIMESTAMP
                            ? "datetime-local"
                            : "text"
                        }
                        step={
                          column.dataType.toUpperCase() == DataType.TIME ||
                          column.dataType.toUpperCase() == DataType.TIMESTAMP
                            ? 1 // Allows input with seconds precision
                            : undefined
                        }
                        placeholder={getCompatibleDefaultValuePattern(
                          column.dataType.toUpperCase() as DataType
                        )}
                        disabled={
                          (column.dataType.toUpperCase() as DataType) == DataType.TEXT || isPending
                        }
                        {...field}
                        value={field.value || ""}
                        onChange={
                          column.dataType.toUpperCase() == DataType.TIMESTAMP
                            ? e => {
                                const parts = e.target.value.split("T");
                                if (parts.length == 2) {
                                  if (parts[1].length == 5) {
                                    parts[1] += ":00";
                                  }
                                }
                                field.onChange(parts.join(" "));
                              }
                            : column.dataType.toUpperCase() == DataType.TIME
                            ? e => {
                                if (e.target.value.length == 5) {
                                  field.onChange(e.target.value + ":00");
                                } else {
                                  field.onChange(e.target.value);
                                }
                              }
                            : field.onChange
                        }
                      />
                    </FormControl>
                    {(column.dataType.toUpperCase() as DataType) == DataType.TEXT && (
                      <FormDescription>TEXT columns cannot have default values</FormDescription>
                    )}
                    {column.isUnique && (
                      <FormDescription>
                        Unique columns should have NULL default value
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="min-w-24">
                  {isPending ? "Updating..." : "Update Default"}
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
