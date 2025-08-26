"use client";

import { useEffect, useState } from "react";
import { BaseTableColumnMetadataDto } from "@/lib/types/database";
import { useUpdateColumnForeignKeyForm } from "@/lib/hooks/use-column-edit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FKOnAction } from "@/lib/types";
import { Link2, Unlink, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common";

interface ColumnForeignKeyDialogProps {
  column: Omit<BaseTableColumnMetadataDto, "table">;
  schemaName: string;
  tableName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ColumnForeignKeyDialog({
  column,
  schemaName,
  tableName,
  open,
  onOpenChange,
  onSuccess,
}: ColumnForeignKeyDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const {
    form,
    isPending,
    submitError,
    submitForeignKeyUpdate,
    submitForeignKeyRemoval,
    resetForm,
    hasForeignKey,
    isDirty,
    errors,
  } = useUpdateColumnForeignKeyForm({
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

  const handleRemoveForeignKey = async () => {
    await submitForeignKeyRemoval();
  };

  const handleFormSubmit = form.handleSubmit(async data => {
    await submitForeignKeyUpdate(data);
  });

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

  if (hasForeignKey) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Remove Foreign Key Constraint
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the foreign key constraint from column &ldquo;
              {column.columnName}&rdquo;? This action cannot be undone and will remove the
              referential integrity constraint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveForeignKey}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Unlink className="w-4 h-4 mr-2" />
              Remove Foreign Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Create Foreign Key Constraint
            </DialogTitle>
            <DialogDescription>
              Create a foreign key constraint for column &ldquo;{column.columnName}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {(errors.root?.message || submitError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.root?.message || submitError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="referencedSchemaName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referenced Schema *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter schema name"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referencedTableName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referenced Table *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter table name"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="referencedColumnName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referenced Column *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter column name"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="onUpdateAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>On Update Action *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(FKOnAction).map(action => (
                              <SelectItem key={action} value={action}>
                                {action}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="onDeleteAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>On Delete Action *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(FKOnAction).map(action => (
                              <SelectItem key={action} value={action}>
                                {action}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    The referenced table and column must exist and have compatible data types. The
                    referenced column should typically be a primary key.
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  <Link2 className="w-4 h-4 mr-2" />
                  {isPending ? "Creating..." : "Create Foreign Key"}
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
