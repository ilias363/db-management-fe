"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { IndexColumnSchema, indexColumnSchema } from "@/lib/schemas/database";
import { SortDirection } from "@/lib/types";

interface IndexColumnManagerProps {
  columns: IndexColumnSchema[];
  onChange: (columns: IndexColumnSchema[]) => void;
  availableColumns: string[];
  errors?: Record<string, string[]>;
}

interface IndexColumnFormProps {
  column?: IndexColumnSchema;
  onSave: (column: IndexColumnSchema) => void;
  onCancel: () => void;
  availableColumns: string[];
}

interface IndexColumnCardProps {
  column: IndexColumnSchema;
  index: number;
  onUpdate: (column: IndexColumnSchema) => void;
  onRemove: () => void;
  availableColumns: string[];
}

function IndexColumnCard({ column, onUpdate, onRemove, availableColumns }: IndexColumnCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <IndexColumnForm
        column={column}
        availableColumns={availableColumns}
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
              <Badge variant="secondary">{column.sortOrder || "ASC"}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Sort Order: {column.sortOrder || SortDirection.ASC}
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

function IndexColumnForm({ column, onSave, onCancel, availableColumns }: IndexColumnFormProps) {
  const form = useForm<IndexColumnSchema>({
    resolver: zodResolver(indexColumnSchema),
    defaultValues: column || {
      columnName: "",
      sortOrder: SortDirection.ASC,
    },
    mode: "onChange",
  });

  const { handleSubmit } = form;

  const onSubmit = (data: IndexColumnSchema) => {
    onSave(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {column ? "Edit Index Column" : "Add Index Column"}
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
                    <FormLabel>Column *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableColumns.map(columnName => (
                          <SelectItem key={columnName} value={columnName}>
                            {columnName}
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
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sort order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SortDirection.ASC}>ASC</SelectItem>
                        <SelectItem value={SortDirection.DESC}>DESC</SelectItem>
                      </SelectContent>
                    </Select>
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

export function IndexColumnManager({
  columns,
  onChange,
  availableColumns,
}: IndexColumnManagerProps) {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (column: IndexColumnSchema) => {
    onChange([...columns, column]);
    setShowForm(false);
  };

  const handleUpdate = (index: number, column: IndexColumnSchema) => {
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
          <IndexColumnCard
            key={index}
            column={column}
            index={index}
            availableColumns={availableColumns}
            onUpdate={updated => handleUpdate(index, updated)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </div>

      {showForm ? (
        <IndexColumnForm
          availableColumns={availableColumns}
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Index Column
        </Button>
      )}

      {columns.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No index columns added yet</div>
      )}
    </div>
  );
}
