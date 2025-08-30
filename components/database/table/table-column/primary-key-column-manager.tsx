"use client";

import { useState } from "react";
import { PrimaryKeyColumnSchema } from "@/lib/schemas/database";
import { AUTO_INCREMENT_COMPATIBLE_TYPES, ColumnType, DataType } from "@/lib/types";
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
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { primaryKeyColumnSchema } from "@/lib/schemas/database";

const NEEDS_CHARACTER_MAX_LENGTH = [DataType.VARCHAR, DataType.CHAR];

const NEEDS_NUMERIC_PRECISION = [DataType.DECIMAL, DataType.NUMERIC];

const DATA_TYPES = Object.values(DataType);

interface PrimaryKeyColumnManagerProps {
  columns: PrimaryKeyColumnSchema[];
  onChange: (columns: PrimaryKeyColumnSchema[]) => void;
  errors?: Record<string, string[]>;
}

interface PrimaryKeyColumnFormProps {
  column?: PrimaryKeyColumnSchema;
  onSave: (column: PrimaryKeyColumnSchema) => void;
  onCancel: () => void;
}

interface PrimaryKeyColumnCardProps {
  column: PrimaryKeyColumnSchema;
  index: number;
  onUpdate: (column: PrimaryKeyColumnSchema) => void;
  onRemove: () => void;
}

function PrimaryKeyColumnCard({ column, onUpdate, onRemove }: PrimaryKeyColumnCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <PrimaryKeyColumnForm
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
              <Badge variant="default">{column.dataType}</Badge>
              {column.autoIncrement && <Badge variant="outline">AUTO_INCREMENT</Badge>}
              <Badge variant="destructive">PRIMARY KEY</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {column.characterMaxLength && `Max Length: ${column.characterMaxLength}`}
              {column.numericPrecision && `Precision: ${column.numericPrecision}`}
              {column.numericScale !== undefined && `, Scale: ${column.numericScale}`}
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

function PrimaryKeyColumnForm({ column, onSave, onCancel }: PrimaryKeyColumnFormProps) {
  const form = useForm<PrimaryKeyColumnSchema>({
    resolver: zodResolver(primaryKeyColumnSchema),
    defaultValues: column || {
      columnName: "",
      columnType: ColumnType.PRIMARY_KEY,
      dataType: DataType.INT,
      characterMaxLength: undefined,
      numericPrecision: undefined,
      numericScale: undefined,
      autoIncrement: false,
    },
    mode: "onChange",
  });

  const { handleSubmit, setValue } = form;
  const dataType = useWatch({ control: form.control, name: "dataType" });

  const handleDataTypeChange = (newDataType: DataType) => {
    setValue("characterMaxLength", undefined);
    setValue("numericPrecision", undefined);
    setValue("numericScale", undefined);

    setValue("dataType", newDataType);
  };

  const onSubmit = (data: PrimaryKeyColumnSchema) => {
    onSave(data);
  };

  const isAutoIncrementSupported = AUTO_INCREMENT_COMPATIBLE_TYPES.includes(dataType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {column ? "Edit Primary Key Column" : "Add Primary Key Column"}
        </CardTitle>
        <CardDescription>
          Primary key columns automatically have NOT NULL constraint
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
                      <Input placeholder="id" {...field} />
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

            <FormField
              control={form.control}
              name="autoIncrement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isAutoIncrementSupported}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Auto Increment</FormLabel>
                    <FormDescription>
                      {isAutoIncrementSupported
                        ? "Automatically generate sequential values"
                        : "Auto increment not available for selected type"}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

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

export function PrimaryKeyColumnManager({ columns, onChange }: PrimaryKeyColumnManagerProps) {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (column: PrimaryKeyColumnSchema) => {
    onChange([...columns, column]);
    setShowForm(false);
  };

  const handleUpdate = (index: number, column: PrimaryKeyColumnSchema) => {
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
          <PrimaryKeyColumnCard
            key={index}
            column={column}
            index={index}
            onUpdate={updated => handleUpdate(index, updated)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </div>

      {showForm ? (
        <PrimaryKeyColumnForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Primary Key Column
        </Button>
      )}

      {columns.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No primary key columns added yet
        </div>
      )}
    </div>
  );
}
