"use client";

import { useState, useEffect, useMemo } from "react";
import { TableMetadataDto } from "@/lib/types/database";
import { useUpdateColumnPrimaryKeyForm } from "@/lib/hooks/use-column-edit";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ConfirmDialog } from "@/components/common";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Key, Info } from "lucide-react";
import { ColumnType } from "@/lib/types";
import { toast } from "sonner";

interface ColumnPrimaryKeyDialogProps {
  table: TableMetadataDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ColumnPrimaryKeyDialog({
  table,
  open,
  onOpenChange,
  onSuccess,
}: ColumnPrimaryKeyDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Check if table already has a primary key
  const existingPkColumns = useMemo(
    () =>
      table.columns?.filter(col =>
        [ColumnType.PRIMARY_KEY, ColumnType.PRIMARY_KEY_FOREIGN_KEY].includes(col.columnType)
      ) || [],
    [table.columns]
  );
  const hasPrimaryKey = existingPkColumns.length > 0;
  const isRemovingPk = hasPrimaryKey;

  const {
    form,
    isPending,
    submitError,
    submitPrimaryKeyUpdate,
    resetForm,
    isValid,
    isDirty,
    errors,
    availableColumns,
  } = useUpdateColumnPrimaryKeyForm({
    schemaName: table.schema.schemaName,
    tableName: table.tableName,
    columns: table.columns || [],
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
    },
    onError: error => toast.error(error),
  });

  useEffect(() => {
    if (open) {
      resetForm();
      form.setValue("isPrimaryKey", !isRemovingPk);
      if (isRemovingPk) {
        // When removing, set the existing PK columns
        form.setValue(
          "columnNames",
          existingPkColumns.map(col => col.columnName)
        );
      }
    }
  }, [open, resetForm, form, isRemovingPk, existingPkColumns]);

  const handleClose = () => {
    if (isDirty && !isPending) {
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {isRemovingPk ? "Remove Primary Key" : "Create Primary Key"}
            </DialogTitle>
            <DialogDescription>
              {isRemovingPk
                ? `Remove the existing primary key from table "${table.tableName}".`
                : `Create a primary key for table "${table.tableName}" by selecting one or more columns.`}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitPrimaryKeyUpdate)} className="space-y-6">
              {(errors.root?.message || submitError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.root?.message || submitError}</AlertDescription>
                </Alert>
              )}

              {isRemovingPk ? (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">Current Primary Key Columns:</p>
                        <div className="flex flex-wrap gap-2">
                          {existingPkColumns.map(col => (
                            <span
                              key={col.columnName}
                              className="px-2 py-1 bg-muted rounded text-sm"
                            >
                              {col.columnName}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Removing the primary key will make all these columns regular columns.
                          Foreign key constraints referencing this primary key may prevent removal.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                  <FormField
                    control={form.control}
                    name="force"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormLabel className="flex-col items-start cursor-pointer">
                          Force remove primary key
                          <p className="font-normal">
                            Automatically drops any foreign key constraints on this column.
                          </p>
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="columnNames"
                  render={() => (
                    <FormItem>
                      <FormLabel>Select Columns for Primary Key</FormLabel>
                      <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                        {availableColumns.map(columnName => (
                          <FormField
                            key={columnName}
                            control={form.control}
                            name="columnNames"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={columnName}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(columnName)}
                                      onCheckedChange={checked => {
                                        return checked
                                          ? field.onChange([...field.value, columnName])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value: string) => value !== columnName
                                              )
                                            );
                                      }}
                                      disabled={isPending}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {columnName}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                      <div className="text-sm text-muted-foreground">
                        Select one or more columns to form a composite primary key.
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={isRemovingPk ? "destructive" : "default"}
                  disabled={!isValid || isPending}
                  className="min-w-24"
                >
                  {isPending
                    ? isRemovingPk
                      ? "Removing..."
                      : "Creating..."
                    : isRemovingPk
                    ? "Remove Primary Key"
                    : "Create Primary Key"}
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
