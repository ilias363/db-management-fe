"use client";

import { useState } from "react";
import { getCompatibleDefaultValuePattern, StandardColumnSchema } from "@/lib/schemas/database";
import { ColumnType, DataType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { standardColumnSchema } from "@/lib/schemas/database";

const NEEDS_CHARACTER_MAX_LENGTH = [DataType.VARCHAR, DataType.CHAR];

const NEEDS_NUMERIC_PRECISION = [DataType.DECIMAL, DataType.NUMERIC];

const DATA_TYPES = Object.values(DataType);

interface StandardColumnManagerProps {
  columns: StandardColumnSchema[];
  onChange: (columns: StandardColumnSchema[]) => void;
  errors?: Record<string, string[]>;
}

interface StandardColumnFormProps {
  column?: StandardColumnSchema;
  onSave: (column: StandardColumnSchema) => void;
  onCancel: () => void;
}

interface StandardColumnCardProps {
  column: StandardColumnSchema;
  index: number;
  onUpdate: (column: StandardColumnSchema) => void;
  onRemove: () => void;
}

function StandardColumnCard({ column, onUpdate, onRemove }: StandardColumnCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <StandardColumnForm
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
              <Badge variant="secondary">{column.dataType}</Badge>
              {column.isUnique && <Badge variant="outline">UNIQUE</Badge>}
              {!column.isNullable && <Badge variant="outline">NOT NULL</Badge>}
            </div>
            <div className="text-sm text-muted-foreground">
              {column.characterMaxLength && `Max Length: ${column.characterMaxLength} `}
              {column.numericPrecision && `Precision: ${column.numericPrecision} `}
              {column.numericScale && `Scale: ${column.numericScale} `}
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

function StandardColumnForm({ column, onSave, onCancel }: StandardColumnFormProps) {
  const form = useForm<StandardColumnSchema>({
    resolver: zodResolver(standardColumnSchema),
    defaultValues: column || {
      columnName: "",
      columnType: ColumnType.STANDARD,
      dataType: DataType.VARCHAR,
      characterMaxLength: undefined,
      numericPrecision: undefined,
      numericScale: undefined,
      isNullable: true,
      isUnique: false,
      columnDefault: undefined,
    },
    mode: "onChange",
  });

  const { handleSubmit, setValue } = form;
  const dataType = useWatch({ control: form.control, name: "dataType" });
  const isUnique = useWatch({ control: form.control, name: "isUnique" });

  const handleDataTypeChange = (newDataType: DataType) => {
    setValue("characterMaxLength", undefined);
    setValue("numericPrecision", undefined);
    setValue("numericScale", undefined);
    setValue("columnDefault", undefined);

    setValue("dataType", newDataType);
  };

  const onSubmit = (data: StandardColumnSchema) => {
    onSave(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {column ? "Edit Standard Column" : "Add Standard Column"}
        </CardTitle>
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
                      <Input placeholder="column_name" {...field} />
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

            <div className="grid grid-cols-2 gap-4">
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
                name="isUnique"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Is Unique</FormLabel>
                      <FormDescription>Enforce unique constraint</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
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
                      disabled={dataType === DataType.TEXT}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  {dataType === DataType.TEXT && (
                    <FormDescription>TEXT columns cannot have default values</FormDescription>
                  )}
                  {isUnique && (
                    <FormDescription>Unique columns should have NULL default value</FormDescription>
                  )}
                  <FormMessage />
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

export function StandardColumnManager({ columns, onChange }: StandardColumnManagerProps) {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (column: StandardColumnSchema) => {
    onChange([...columns, column]);
    setShowForm(false);
  };

  const handleUpdate = (index: number, column: StandardColumnSchema) => {
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
          <StandardColumnCard
            key={index}
            column={column}
            index={index}
            onUpdate={updated => handleUpdate(index, updated)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </div>

      {showForm ? (
        <StandardColumnForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Standard Column
        </Button>
      )}

      {columns.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No standard columns added yet</div>
      )}
    </div>
  );
}
