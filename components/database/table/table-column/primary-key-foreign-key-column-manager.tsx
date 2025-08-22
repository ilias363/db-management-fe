"use client";

import { useState } from "react";
import { PrimaryKeyForeignKeyColumnSchema } from "@/lib/schemas/database";
import { ColumnType, DataType, FKOnAction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { primaryKeyForeignKeyColumnSchema } from "@/lib/schemas/database";

const NEEDS_CHARACTER_MAX_LENGTH = [DataType.VARCHAR, DataType.CHAR];

const NEEDS_NUMERIC_PRECISION = [DataType.DECIMAL, DataType.NUMERIC];

const DATA_TYPES = Object.values(DataType);

const FK_ON_ACTIONS = Object.values(FKOnAction);

interface PrimaryKeyForeignKeyColumnManagerProps {
  columns: PrimaryKeyForeignKeyColumnSchema[];
  onChange: (columns: PrimaryKeyForeignKeyColumnSchema[]) => void;
  errors?: Record<string, string[]>;
}

interface PrimaryKeyForeignKeyColumnFormProps {
  column?: PrimaryKeyForeignKeyColumnSchema;
  onSave: (column: PrimaryKeyForeignKeyColumnSchema) => void;
  onCancel: () => void;
}

interface PrimaryKeyForeignKeyColumnCardProps {
  column: PrimaryKeyForeignKeyColumnSchema;
  index: number;
  onUpdate: (column: PrimaryKeyForeignKeyColumnSchema) => void;
  onRemove: () => void;
}

function PrimaryKeyForeignKeyColumnCard({
  column,
  onUpdate,
  onRemove,
}: PrimaryKeyForeignKeyColumnCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <PrimaryKeyForeignKeyColumnForm
        column={column}
        onSave={updated => {
          onUpdate(updated);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{column.columnName}</span>
              <Badge variant="destructive">{column.dataType}</Badge>
              <Badge variant="default">PRIMARY KEY</Badge>
              <Badge variant="secondary">FOREIGN KEY</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              References: {column.referencedSchemaName}.{column.referencedTableName}.
              {column.referencedColumnName}
              {column.onUpdateAction && ` | ON UPDATE ${column.onUpdateAction}`}
              {column.onDeleteAction && ` | ON DELETE ${column.onDeleteAction}`}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PrimaryKeyForeignKeyColumnForm({
  column,
  onSave,
  onCancel,
}: PrimaryKeyForeignKeyColumnFormProps) {
  // A state to force re-render cuz the form doesn't automatically update the fields
  // (probably something related to react-compiler auto memoization)
  const [rerenderTrigger, setRerenderTrigger] = useState(1);

  const form = useForm<PrimaryKeyForeignKeyColumnSchema>({
    resolver: zodResolver(primaryKeyForeignKeyColumnSchema),
    defaultValues: column || {
      columnName: "",
      columnType: ColumnType.PRIMARY_KEY_FOREIGN_KEY,
      dataType: DataType.INT,
      characterMaxLength: undefined,
      numericPrecision: undefined,
      numericScale: undefined,
      referencedSchemaName: "",
      referencedTableName: "",
      referencedColumnName: "",
      onUpdateAction: undefined,
      onDeleteAction: undefined,
    },
    mode: "onChange",
  });

  const { handleSubmit, watch, setValue } = form;
  const dataType = watch("dataType");

  const handleDataTypeChange = (newDataType: DataType) => {
    setValue("characterMaxLength", undefined);
    setValue("numericPrecision", undefined);
    setValue("numericScale", undefined);

    setValue("dataType", newDataType);
    setRerenderTrigger(prev => prev + 1);
  };

  const onSubmit = (data: PrimaryKeyForeignKeyColumnSchema) => {
    onSave(data);
  };

  const requiresCharacterMaxLength =
    NEEDS_CHARACTER_MAX_LENGTH.includes(dataType) && !!rerenderTrigger;
  const supportsNumericPrecision = NEEDS_NUMERIC_PRECISION.includes(dataType) && !!rerenderTrigger;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {column
            ? "Edit Primary Key + Foreign Key Column"
            : "Add Primary Key + Foreign Key Column"}
        </CardTitle>
        <CardDescription>
          Create a column that serves as both primary key and foreign key (composite relationship)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="columnName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Column Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="parent_id" {...field} />
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
                    <Select onValueChange={handleDataTypeChange} defaultValue={field.value}>
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

            {requiresCharacterMaxLength && (
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {supportsNumericPrecision && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numericPrecision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numeric Precision *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="10"
                          value={field.value || ""}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
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
                      <FormLabel>Numeric Scale *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="2"
                          value={field.value || ""}
                          onChange={e =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Foreign Key Reference Fields */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Foreign Key Reference</h4>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="referencedSchemaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referenced Schema *</FormLabel>
                      <FormControl>
                        <Input placeholder="public" {...field} />
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
                        <Input placeholder="categories" {...field} />
                      </FormControl>
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
                        <Input placeholder="id" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="onDeleteAction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>On Delete Action</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FK_ON_ACTIONS.map(type => (
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

                <FormField
                  control={form.control}
                  name="onUpdateAction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>On Update Action</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FK_ON_ACTIONS.map(type => (
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
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit(onSubmit)}>
                {column ? "Update" : "Add"} Column
              </Button>
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

export function PrimaryKeyForeignKeyColumnManager({
  columns,
  onChange,
}: PrimaryKeyForeignKeyColumnManagerProps) {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (column: PrimaryKeyForeignKeyColumnSchema) => {
    onChange([...columns, column]);
    setShowForm(false);
  };

  const handleUpdate = (index: number, column: PrimaryKeyForeignKeyColumnSchema) => {
    const updated = [...columns];
    updated[index] = column;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(columns.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {columns.map((column, index) => (
          <PrimaryKeyForeignKeyColumnCard
            key={index}
            column={column}
            index={index}
            onUpdate={updated => handleUpdate(index, updated)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </div>

      {showForm ? (
        <PrimaryKeyForeignKeyColumnForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Primary Key + Foreign Key Column
        </Button>
      )}

      {columns.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No primary key + foreign key columns added yet
        </div>
      )}
    </div>
  );
}
