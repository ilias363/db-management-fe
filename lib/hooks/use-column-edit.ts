"use client";

import { useState, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BaseTableColumnMetadataDto } from "@/lib/types/database";
import {
    RenameColumnSchema,
    renameColumnSchema,
    UpdateColumnDataTypeSchema,
    updateColumnDataTypeSchema,
    UpdateColumnAutoIncrementSchema,
} from "@/lib/schemas/database/column-edit";
import {
    renameColumn,
    updateColumnDataType,
    updateColumnAutoIncrement,
} from "@/lib/actions/database/column-edit";

// Hook for renaming columns
interface UseRenameColumnProps {
    column: Omit<BaseTableColumnMetadataDto, "table">;
    schemaName: string;
    tableName: string;
    onSuccess?: (column: BaseTableColumnMetadataDto) => void;
    onError?: (error: string) => void;
}

export function useRenameColumnForm({
    column,
    schemaName,
    tableName,
    onSuccess,
    onError,
}: UseRenameColumnProps) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<RenameColumnSchema>({
        resolver: zodResolver(renameColumnSchema),
        defaultValues: {
            schemaName,
            tableName,
            columnName: column.columnName,
            newColumnName: column.columnName,
        },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        form.reset({
            schemaName,
            tableName,
            columnName: column.columnName,
            newColumnName: column.columnName,
        });
        setSubmitError(null);
        form.clearErrors();
    }, [form, column, schemaName, tableName]);

    const submitRename = useCallback(
        async (data: RenameColumnSchema) => {
            setSubmitError(null);
            form.clearErrors();

            startTransition(async () => {
                try {
                    const result = await renameColumn(undefined, data);

                    if (result.success && result.data) {
                        toast.success(result.message || "Column renamed successfully");
                        onSuccess?.(result.data);
                        resetForm();
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    if (field in form.getValues()) {
                                        form.setError(field as keyof RenameColumnSchema, {
                                            type: "server",
                                            message: Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors,
                                        });
                                    }
                                }
                            });
                        }

                        if (result.message && !result.errors) {
                            setSubmitError(result.message);
                        }

                        onError?.(result.message || "An error occurred");
                    }
                } catch (error) {
                    const errorMessage =
                        error instanceof Error ? error.message : "An unexpected error occurred";
                    setSubmitError(errorMessage);
                    onError?.(errorMessage);
                }
            });
        },
        [form, onSuccess, onError, resetForm]
    );

    return {
        form,
        isPending,
        submitError,
        submitRename,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}

// Hook for updating column data type
interface UseUpdateColumnDataTypeProps {
    column: Omit<BaseTableColumnMetadataDto, "table">;
    schemaName: string;
    tableName: string;
    onSuccess?: (column: BaseTableColumnMetadataDto) => void;
    onError?: (error: string) => void;
}

export function useUpdateColumnDataTypeForm({
    column,
    schemaName,
    tableName,
    onSuccess,
    onError,
}: UseUpdateColumnDataTypeProps) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<UpdateColumnDataTypeSchema>({
        resolver: zodResolver(updateColumnDataTypeSchema),
        defaultValues: {
            schemaName,
            tableName,
            columnName: column.columnName,
            dataType: column.dataType,
            characterMaxLength: column.characterMaxLength,
            numericPrecision: column.numericPrecision,
            numericScale: column.numericScale,
        },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        form.reset({
            schemaName,
            tableName,
            columnName: column.columnName,
            dataType: column.dataType,
            characterMaxLength: column.characterMaxLength,
            numericPrecision: column.numericPrecision,
            numericScale: column.numericScale,
        });
        setSubmitError(null);
        form.clearErrors();
    }, [form, column, schemaName, tableName]);

    const submitUpdate = useCallback(
        async (data: UpdateColumnDataTypeSchema) => {
            setSubmitError(null);
            form.clearErrors();

            startTransition(async () => {
                try {
                    const result = await updateColumnDataType(undefined, data);

                    if (result.success && result.data) {
                        toast.success(result.message || "Column data type updated successfully");
                        onSuccess?.(result.data);
                        resetForm();
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    if (field in form.getValues()) {
                                        form.setError(field as keyof UpdateColumnDataTypeSchema, {
                                            type: "server",
                                            message: Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors,
                                        });
                                    }
                                }
                            });
                        }

                        if (result.message && !result.errors) {
                            setSubmitError(result.message);
                        }

                        onError?.(result.message || "An error occurred");
                    }
                } catch (error) {
                    const errorMessage =
                        error instanceof Error ? error.message : "An unexpected error occurred";
                    setSubmitError(errorMessage);
                    onError?.(errorMessage);
                }
            });
        },
        [form, onSuccess, onError, resetForm]
    );

    return {
        form,
        isPending,
        submitError,
        submitUpdate,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}

// Hook for auto-increment toggle
interface UseUpdateColumnAutoIncrementProps {
    column: Omit<BaseTableColumnMetadataDto, "table">;
    schemaName: string;
    tableName: string;
    onSuccess?: (column: BaseTableColumnMetadataDto) => void;
    onError?: (error: string) => void;
}

export function useUpdateColumnAutoIncrementForm({
    column,
    schemaName,
    tableName,
    onSuccess,
    onError,
}: UseUpdateColumnAutoIncrementProps) {
    const [isPending, startTransition] = useTransition();

    const submitAutoIncrementToggle = useCallback(
        async (autoIncrement: boolean) => {
            const formData: UpdateColumnAutoIncrementSchema = {
                schemaName,
                tableName,
                columnName: column.columnName,
                autoIncrement,
            };

            startTransition(async () => {
                try {
                    const result = await updateColumnAutoIncrement(undefined, formData);

                    if (result.success && result.data) {
                        toast.success(result.message || "Column auto-increment updated successfully");
                        onSuccess?.(result.data);
                    } else {
                        const errorMessage = result.message || "Failed to update column auto-increment";
                        toast.error(errorMessage);
                        onError?.(errorMessage);
                    }
                } catch (error) {
                    const errorMessage =
                        error instanceof Error ? error.message : "An unexpected error occurred";
                    toast.error(errorMessage);
                    onError?.(errorMessage);
                }
            });
        },
        [column, schemaName, tableName, onSuccess, onError]
    );

    return {
        isPending,
        submitAutoIncrementToggle,
    };
}
