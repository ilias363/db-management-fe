"use client";

import { useEffect, useState } from "react";
import { ColumnType } from "@/lib/types";
import { TableMetadataDto } from "@/lib/types/database";
import {
  StandardColumnSchema,
  PrimaryKeyColumnSchema,
  ForeignKeyColumnSchema,
  PrimaryKeyForeignKeyColumnSchema,
} from "@/lib/schemas/database";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  StandardColumnManager,
  PrimaryKeyColumnManager,
  ForeignKeyColumnManager,
  PrimaryKeyForeignKeyColumnManager,
} from "@/components/database";
import { AlertCircle, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useCreateTableForm } from "@/lib/hooks/use-table-form";

interface CreateTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSchemaName?: string;
  onSuccess?: (table?: TableMetadataDto) => void;
}

export function CreateTableDialog({
  open,
  onOpenChange,
  selectedSchemaName,
  onSuccess,
}: CreateTableDialogProps) {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const {
    form,
    isValid,
    isPending,
    isDirty,
    submitError,
    submitTable,
    resetForm,
    getColumnSummary,
    errors,
  } = useCreateTableForm({
    onSuccess: table => {
      onSuccess?.(table);
      onOpenChange(false);
    },
  });

  const { handleSubmit } = form;

  useEffect(() => {
    if (open) {
      resetForm(selectedSchemaName);
    }
  }, [open, selectedSchemaName, resetForm]);

  const handleClose = () => {
    if (isDirty && !isPending) {
      setShowDiscardDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardDialog(false);
    onOpenChange(false);
  };

  const allColumns = getColumnSummary();

  const isFormValid = allColumns.length > 0 && isValid;

  const standardColumnsLength = form.watch("standardColumns").length;
  const primaryKeyColumnsLength = form.watch("primaryKeyColumns").length;
  const foreignKeyColumnsLength = form.watch("foreignKeyColumns").length;
  const primaryKeyForeignKeyColumnsLength = form.watch("primaryKeyForeignKeyColumns").length;

  // Trigger validation when columns change
  useEffect(() => {
    form.trigger();
  }, [
    form,
    standardColumnsLength,
    primaryKeyColumnsLength,
    foreignKeyColumnsLength,
    primaryKeyForeignKeyColumnsLength,
  ]);

  const getColumnTypeBadgeVariant = (columnType: ColumnType) => {
    switch (columnType) {
      case ColumnType.STANDARD:
        return "secondary" as const;
      case ColumnType.PRIMARY_KEY:
        return "default" as const;
      case ColumnType.FOREIGN_KEY:
        return "outline" as const;
      case ColumnType.PRIMARY_KEY_FOREIGN_KEY:
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  const getColumnConstraints = (
    column:
      | StandardColumnSchema
      | PrimaryKeyColumnSchema
      | ForeignKeyColumnSchema
      | PrimaryKeyForeignKeyColumnSchema
  ) => {
    const constraints = [];
    if ("isNullable" in column && column.isNullable === false) constraints.push("NOT NULL");
    if ("isUnique" in column && column.isUnique) constraints.push("UNIQUE");
    if ("autoIncrement" in column && column.autoIncrement) constraints.push("AUTO_INCREMENT");
    if ("referencedTableName" in column && column.referencedTableName) constraints.push("FK");
    return constraints.join(", ") || "None";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="lg:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Table</DialogTitle>
            <DialogDescription>
              Create a new table with columns organized by type for better management.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit(submitTable)} className="space-y-6">
              {(errors.root?.message || submitError) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.root?.message || submitError}</AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Table Information</CardTitle>
                  <CardDescription>Basic metadata for the new table</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="schemaName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Schema Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter schema name" {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            The selected schema for the new table. This cannot be changed.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tableName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Table Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter table name" {...field} disabled={isPending} />
                          </FormControl>
                          <FormDescription>
                            Must start with a letter and contain only alphanumeric characters and
                            underscores
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Table Columns</CardTitle>
                  <CardDescription>
                    Organize columns by type for better management. At least one column is required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="standard" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="standard" disabled={isPending}>
                        Standard Columns ({standardColumnsLength})
                      </TabsTrigger>
                      <TabsTrigger value="primary-key" disabled={isPending}>
                        Primary Key ({primaryKeyColumnsLength})
                      </TabsTrigger>
                      <TabsTrigger value="foreign-key" disabled={isPending}>
                        Foreign Key ({foreignKeyColumnsLength})
                      </TabsTrigger>
                      <TabsTrigger value="pk-fk" disabled={isPending}>
                        PK + FK ({primaryKeyForeignKeyColumnsLength})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="standard" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="standardColumns"
                        render={({ field }) => (
                          <FormItem>
                            <StandardColumnManager
                              columns={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="primary-key" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="primaryKeyColumns"
                        render={({ field }) => (
                          <FormItem>
                            <PrimaryKeyColumnManager
                              columns={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="foreign-key" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="foreignKeyColumns"
                        render={({ field }) => (
                          <FormItem>
                            <ForeignKeyColumnManager
                              columns={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="pk-fk" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="primaryKeyForeignKeyColumns"
                        render={({ field }) => (
                          <FormItem>
                            <PrimaryKeyForeignKeyColumnManager
                              columns={field.value}
                              onChange={field.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {allColumns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Column Summary</CardTitle>
                    <CardDescription>
                      Overview of all columns in the table ({allColumns.length} column
                      {allColumns.length > 1 ? "s" : ""})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Data Type</TableHead>
                          <TableHead>Constraints</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allColumns.map((column, index) => (
                          <TableRow key={`${column.columnType}-${column.columnName}-${index}`}>
                            <TableCell className="font-medium">{column.columnName}</TableCell>
                            <TableCell>
                              <Badge variant={getColumnTypeBadgeVariant(column.columnType)}>
                                {column.columnType.replaceAll("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>{column.dataType}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {getColumnConstraints(column)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {!isFormValid && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please ensure there are no validation errors and at least one column is added.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Actions */}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!isFormValid || isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Table"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleDiscardChanges}
        title="Discard Changes?"
        description="You have unsaved changes. Are you sure you want to discard them and close this dialog?"
        confirmText="Discard"
        cancelText="Keep Editing"
        variant="destructive"
      />
    </>
  );
}
