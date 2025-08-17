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
import { useCreateIndexForm } from "@/lib/hooks";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableMetadataDto, IndexMetadataDto } from "@/lib/types/database";
import { ConfirmDialog } from "@/components/common";
import { IndexType } from "@/lib/types";
import { IndexColumnManager } from "./index-column-manager";

interface CreateIndexDialogProps {
  table: TableMetadataDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (index?: IndexMetadataDto) => void;
}

export function CreateIndexDialog({
  table,
  open,
  onOpenChange,
  onSuccess,
}: CreateIndexDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const availableColumns = table.columns.map(col => col.columnName);

  const { form, isPending, submitError, submitIndex, resetForm, isDirty, errors } =
    useCreateIndexForm({
      schemaName: table.schema.schemaName,
      tableName: table.tableName,
      onSuccess: index => {
        onOpenChange(false);
        onSuccess(index);
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
        <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Index</DialogTitle>
            <DialogDescription>
              Create a new database index on table &ldquo;{table.tableName}&rdquo; to improve query
              performance.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitIndex)} className="space-y-6">
              {(errors.root?.message || submitError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.root?.message || submitError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="indexName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Index Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., idx_user_email"
                          disabled={isPending}
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Index name must start with a letter and contain only letters, numbers, and
                        underscores.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="indexType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Index Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select index type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={IndexType.BTREE}>B-Tree</SelectItem>
                          <SelectItem value={IndexType.HASH}>Hash</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      <FormDescription>
                        B-Tree indexes are good for range queries, Hash indexes for equality
                        comparisons.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isUnique"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Unique Index</FormLabel>
                      <FormDescription>
                        Ensure that no two rows have the same values in the indexed columns.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Index Columns</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="indexColumns"
                    render={({ field }) => (
                      <FormItem>
                        <IndexColumnManager
                          columns={field.value}
                          onChange={field.onChange}
                          availableColumns={availableColumns}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Index"}
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
