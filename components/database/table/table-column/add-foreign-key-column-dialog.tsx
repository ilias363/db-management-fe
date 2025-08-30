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
import { useForeignKeyColumnForm } from "@/lib/hooks";
import { DataType, FKOnAction } from "@/lib/types";
import { getCompatibleDefaultValuePattern } from "@/lib/schemas/database";

const NEEDS_CHARACTER_MAX_LENGTH = [DataType.VARCHAR, DataType.CHAR];

const NEEDS_NUMERIC_PRECISION = [DataType.DECIMAL, DataType.NUMERIC];

const DATA_TYPES = Object.values(DataType);

const FOREIGN_KEY_ACTIONS = Object.values(FKOnAction);

interface AddForeignKeyColumnDialogProps {
  schemaName: string;
  tableName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddForeignKeyColumnDialog({
  schemaName,
  tableName,
  open,
  onOpenChange,
  onSuccess,
}: AddForeignKeyColumnDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const { form, isPending, submitError, submitColumn, resetForm, isDirty, errors } =
    useForeignKeyColumnForm({
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
    setValue("columnDefault", undefined);

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

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Foreign Key Column</DialogTitle>
            <DialogDescription>
              Create a new foreign key column for the table {tableName} in schema {schemaName}. This
              column will reference another table.
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
                        <Input placeholder="user_id" {...field} disabled={isPending} />
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
                name="isNullable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Is Nullable</FormLabel>
                      <FormDescription>Allow NULL values in this column</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium">Foreign Key Reference</h3>

                <div className="grid grid-cols-3 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="referencedSchemaName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referenced Schema *</FormLabel>
                        <FormControl>
                          <Input placeholder="public" {...field} disabled={isPending} />
                        </FormControl>
                        <FormDescription>Schema name of the referenced table</FormDescription>
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
                          <Input placeholder="users" {...field} disabled={isPending} />
                        </FormControl>
                        <FormDescription>Name of the referenced table</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referencedColumnName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referenced Column *</FormLabel>
                        <FormControl>
                          <Input placeholder="id" {...field} disabled={isPending} />
                        </FormControl>
                        <FormDescription>Column name in the referenced table</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="onUpdateAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>On Update Action</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FOREIGN_KEY_ACTIONS.map(action => (
                              <SelectItem key={action} value={action}>
                                {action}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Action to perform when the referenced record is updated
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="onDeleteAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>On Delete Action</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select action (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FOREIGN_KEY_ACTIONS.map(action => (
                              <SelectItem key={action} value={action}>
                                {action}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Action to perform when the referenced record is deleted
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="columnDefault"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Value</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={getCompatibleDefaultValuePattern(dataType)}
                        disabled={dataType === DataType.TEXT || isPending}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    {dataType === DataType.TEXT && (
                      <FormDescription>TEXT columns cannot have default values</FormDescription>
                    )}
                    <FormDescription>Optional default value for the column</FormDescription>
                    <FormMessage />
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
