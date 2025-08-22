"use client";

import { useState } from "react";
import { ForeignKeyColumnSchema, getCompatibleDefaultValuePattern } from "@/lib/schemas/database";
import { ColumnType, DataType, FKOnAction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { foreignKeyColumnSchema } from "@/lib/schemas/database";

const NEEDS_CHARACTER_MAX_LENGTH = [DataType.VARCHAR, DataType.CHAR];

const NEEDS_NUMERIC_PRECISION = [DataType.DECIMAL, DataType.NUMERIC];

const DATA_TYPES = Object.values(DataType);

const FK_ON_ACTIONS = Object.values(FKOnAction);

interface ForeignKeyColumnManagerProps {
  columns: ForeignKeyColumnSchema[];
  onChange: (columns: ForeignKeyColumnSchema[]) => void;
  errors?: Record<string, string[]>;
}

interface ForeignKeyColumnFormProps {
  column?: ForeignKeyColumnSchema;
  onSave: (column: ForeignKeyColumnSchema) => void;
  onCancel: () => void;
}

interface ForeignKeyColumnCardProps {
  column: ForeignKeyColumnSchema;
  index: number;
  onUpdate: (column: ForeignKeyColumnSchema) => void;
  onRemove: () => void;
}

function ForeignKeyColumnCard({ column, onUpdate, onRemove }: ForeignKeyColumnCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ForeignKeyColumnForm
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
              <Badge variant="outline">{column.dataType}</Badge>
              <Badge variant="secondary">FOREIGN KEY</Badge>
              {!column.isNullable && <Badge variant="outline">NOT NULL</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              References: {column.referencedSchemaName}.{column.referencedTableName}.
              {column.referencedColumnName}
              {column.onUpdateAction && ` | ON UPDATE ${column.onUpdateAction}`}
              {column.onDeleteAction && ` | ON DELETE ${column.onDeleteAction}`}
              {column.columnDefault && ` | Default: ${column.columnDefault}`}
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

function ForeignKeyColumnForm({ column, onSave, onCancel }: ForeignKeyColumnFormProps) {
  // A state to force re-render cuz the form doesn't automatically update the fields
  // (probably something related to react-compiler auto memoization)
  const [rerenderTrigger, setRerenderTrigger] = useState(1);

  const form = useForm<ForeignKeyColumnSchema>({
    resolver: zodResolver(foreignKeyColumnSchema),
    defaultValues: column || {
      columnName: "",
      columnType: ColumnType.FOREIGN_KEY,
      dataType: DataType.INT,
      characterMaxLength: undefined,
      numericPrecision: undefined,
      numericScale: undefined,
      referencedSchemaName: "",
      referencedTableName: "",
      referencedColumnName: "",
      onUpdateAction: undefined,
      onDeleteAction: undefined,
      isNullable: true,
      columnDefault: "",
    },
    mode: "onChange",
  });

  const { handleSubmit, watch, setValue } = form;
  const dataType = watch("dataType");

  const handleDataTypeChange = (newDataType: DataType) => {
    setValue("characterMaxLength", undefined);
    setValue("numericPrecision", undefined);
    setValue("numericScale", undefined);
    setValue("columnDefault", undefined);

    setValue("dataType", newDataType);
    setRerenderTrigger(prev => prev + 1);
  };

  const onSubmit = (data: ForeignKeyColumnSchema) => {
    onSave(data);
  };

  const requiresCharacterMaxLength =
    NEEDS_CHARACTER_MAX_LENGTH.includes(dataType) && !!rerenderTrigger;
  const supportsNumericPrecision = NEEDS_NUMERIC_PRECISION.includes(dataType) && !!rerenderTrigger;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {column ? "Edit Foreign Key Column" : "Add Foreign Key Column"}
        </CardTitle>
        <CardDescription>Create a reference to another table&apos;s column</CardDescription>
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
                      <Input placeholder="user_id" {...field} />
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
                        <Input placeholder="users" {...field} />
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

            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="isNullable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Is Nullable</FormLabel>
                      <FormDescription>Allow NULL values in this column</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="columnDefault"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Value</FormLabel>
                    <FormControl>
                      <Input placeholder={getCompatibleDefaultValuePattern(dataType)} {...field} />
                    </FormControl>
                    <FormDescription>Optional default value for the column</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export function ForeignKeyColumnManager({ columns, onChange }: ForeignKeyColumnManagerProps) {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (column: ForeignKeyColumnSchema) => {
    onChange([...columns, column]);
    setShowForm(false);
  };

  const handleUpdate = (index: number, column: ForeignKeyColumnSchema) => {
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
          <ForeignKeyColumnCard
            key={index}
            column={column}
            index={index}
            onUpdate={updated => handleUpdate(index, updated)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </div>

      {showForm ? (
        <ForeignKeyColumnForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Foreign Key Column
        </Button>
      )}

      {columns.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No foreign key columns added yet
        </div>
      )}
    </div>
  );
}
