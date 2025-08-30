"use client";

import { useState, useEffect } from "react";
import { useWatch } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/common";
import { usePrimaryKeyColumnForm } from "@/lib/hooks";
import { AUTO_INCREMENT_COMPATIBLE_TYPES, DataType } from "@/lib/types";

const NEEDS_CHARACTER_MAX_LENGTH = [DataType.VARCHAR, DataType.CHAR];

const NEEDS_NUMERIC_PRECISION = [DataType.DECIMAL, DataType.NUMERIC];

const DATA_TYPES = Object.values(DataType);

interface AddPrimaryKeyColumnDialogProps {
  schemaName: string;
  tableName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddPrimaryKeyColumnDialog({
  schemaName,
  tableName,
  open,
  onOpenChange,
  onSuccess,
}: AddPrimaryKeyColumnDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const { form, isPending, submitError, submitColumn, resetForm, isDirty, errors } =
    usePrimaryKeyColumnForm({
      schemaName,
      tableName,
      onSuccess: () => {
        onSuccess?.();
        onOpenChange(false);
      },
    });

  const { handleSubmit, setValue } = form;
  const dataType = useWatch({ control: form.control, name: "dataType" });

  const handleDataTypeChange = (newDataType: DataType) => {
    setValue("characterMaxLength", undefined);
    setValue("numericPrecision", undefined);
    setValue("numericScale", undefined);

    setValue("dataType", newDataType);
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

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

  const supportsAutoIncrement = AUTO_INCREMENT_COMPATIBLE_TYPES.includes(dataType);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Primary Key Column</DialogTitle>
            <DialogDescription>
              Create a new primary key column for the table {tableName} in schema {schemaName}.
              Primary key columns automatically have NOT NULL constraint.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit(submitColumn)} className="space-y-6">
              {(errors.root?.message || submitError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.root?.message || submitError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="columnName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Column Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="id" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Type *</FormLabel>
                      <Select
                        onValueChange={handleDataTypeChange}
                        defaultValue={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select data type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DATA_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Conditional Data Type Parameters */}
              {NEEDS_CHARACTER_MAX_LENGTH.includes(dataType) && (
                <FormField
                  control={form.control}
                  name="characterMaxLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Character Max Length *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="255"
                          value={field.value || ""}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {NEEDS_NUMERIC_PRECISION.includes(dataType) && (
                <div className="grid grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="numericPrecision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numeric Precision</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="10"
                            value={field.value || ""}
                            onChange={e =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                            }
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numericScale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numeric Scale</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="2"
                            value={field.value || ""}
                            onChange={e =>
                              field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                            }
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="autoIncrement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!supportsAutoIncrement || isPending}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Auto Increment</FormLabel>
                      <FormDescription>
                        {supportsAutoIncrement
                          ? "Automatically generate sequential values"
                          : "Auto increment is only available for INT, INTEGER, SMALLINT, and BIGINT types"}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Column"}
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
