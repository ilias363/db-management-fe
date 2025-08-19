"use client";

import { useState } from "react";
import { BaseTableColumnMetadataDto } from "@/lib/types/database";
import { useUpdateColumnNullableForm } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ColumnType } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface ColumnNullableDialogProps {
  column: Omit<BaseTableColumnMetadataDto, "table">;
  schemaName: string;
  tableName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ColumnNullableDialog({
  column,
  schemaName,
  tableName,
  open,
  onOpenChange,
  onSuccess,
}: ColumnNullableDialogProps) {
  const [populateOption, setPopulateOption] = useState(false);

  const { isPending, submitNullableToggle } = useUpdateColumnNullableForm({
    column,
    schemaName,
    tableName,
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: string) => toast.error(error),
  });

  const canToggle = [ColumnType.STANDARD, ColumnType.FOREIGN_KEY].includes(column.columnType);
  const isChangingToNotNull = column.isNullable;

  const handleToggle = async () => {
    if (!canToggle) return;
    await submitNullableToggle(!column.isNullable, isChangingToNotNull ? populateOption : false);
  };

  const getDescription = () => {
    if (column.isNullable) {
      return `Are you sure you want to set column "${column.columnName}" as NOT NULL? This will prevent NULL values in this column.`;
    } else {
      return `Are you sure you want to allow NULL values for column "${column.columnName}"? This will permit NULL values in this column.`;
    }
  };

  const getButtonText = () => {
    if (isPending) {
      return column.isNullable ? "Setting NOT NULL..." : "Allowing NULL...";
    }
    return column.isNullable ? "Set NOT NULL" : "Allow NULL";
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {column.isNullable ? "Set NOT NULL" : "Allow NULL Values"}
          </AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>

        {!canToggle && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Primary key columns cannot be nullable.</AlertDescription>
          </Alert>
        )}

        {isChangingToNotNull && canToggle && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p>
                  When setting a column to NOT NULL, existing NULL values will cause the operation
                  to fail.
                </p>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="populate"
                    checked={populateOption}
                    onCheckedChange={checked => setPopulateOption(checked as boolean)}
                    disabled={isPending}
                  />
                  <div className="space-y-1">
                    <label htmlFor="populate" className="text-sm font-medium cursor-pointer">
                      Populate NULL values with defaults
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Replace existing NULL values with the a default value before applying NOT NULL
                      constraint.
                    </p>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={column.isNullable ? "destructive" : "default"}
            onClick={handleToggle}
            disabled={isPending || !canToggle}
          >
            {getButtonText()}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
