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
    UpdateColumnPrimaryKeySchema,
    updateColumnPrimaryKeySchema,
    UpdateColumnNullableSchema,
    UpdateColumnUniqueSchema,
    UpdateColumnDefaultSchema,
    updateColumnDefaultSchema,
    UpdateColumnForeignKeySchema,
    updateColumnForeignKeySchema,
} from "@/lib/schemas/database";
import {
    renameColumn,
    updateColumnDataType,
    updateColumnAutoIncrement,
    updateColumnPrimaryKey,
    updateColumnNullable,
    updateColumnUnique,
    updateColumnDefault,
    updateColumnForeignKey,
} from "@/lib/actions/database";
import { DataType, FKOnAction, ColumnType } from "../types";

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
            dataType: column.dataType.toUpperCase() as DataType,
            characterMaxLength: column.characterMaxLength || undefined,
            numericPrecision: column.numericPrecision || undefined,
            numericScale: column.numericScale || undefined,
        },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        form.reset({
            schemaName,
            tableName,
            columnName: column.columnName,
            dataType: column.dataType.toUpperCase() as DataType,
            characterMaxLength: column.characterMaxLength || undefined,
            numericPrecision: column.numericPrecision || undefined,
            numericScale: column.numericScale || undefined,
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

// Hook for nullable toggle
interface UseUpdateColumnNullableProps {
    column: Omit<BaseTableColumnMetadataDto, "table">;
    schemaName: string;
    tableName: string;
    onSuccess?: (column: BaseTableColumnMetadataDto) => void;
    onError?: (error: string) => void;
}

export function useUpdateColumnNullableForm({
    column,
    schemaName,
    tableName,
    onSuccess,
    onError,
}: UseUpdateColumnNullableProps) {
    const [isPending, startTransition] = useTransition();

    const submitNullableToggle = useCallback(
        async (nullable: boolean, populate: boolean = false) => {
            const formData: UpdateColumnNullableSchema = {
                schemaName,
                tableName,
                columnName: column.columnName,
                isNullable: nullable,
                populate,
            };

            startTransition(async () => {
                try {
                    const result = await updateColumnNullable(undefined, formData);

                    if (result.success && result.data) {
                        toast.success(result.message || "Column nullable status updated successfully");
                        onSuccess?.(result.data);
                    } else {
                        const errorMessage = result.message || "Failed to update column nullable status";
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
        submitNullableToggle,
    };
}

// Hook for unique toggle
interface UseUpdateColumnUniqueProps {
    column: Omit<BaseTableColumnMetadataDto, "table">;
    schemaName: string;
    tableName: string;
    onSuccess?: (column: BaseTableColumnMetadataDto) => void;
    onError?: (error: string) => void;
}

export function useUpdateColumnUniqueForm({
    column,
    schemaName,
    tableName,
    onSuccess,
    onError,
}: UseUpdateColumnUniqueProps) {
    const [isPending, startTransition] = useTransition();

    const submitUniqueToggle = useCallback(
        async (unique: boolean) => {
            const formData: UpdateColumnUniqueSchema = {
                schemaName,
                tableName,
                columnName: column.columnName,
                isUnique: unique,
            };

            startTransition(async () => {
                try {
                    const result = await updateColumnUnique(undefined, formData);

                    if (result.success && result.data) {
                        toast.success(result.message || "Column unique constraint updated successfully");
                        onSuccess?.(result.data);
                    } else {
                        const errorMessage = result.message || "Failed to update column unique constraint";
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
        submitUniqueToggle,
    };
}

// Hook for column default value
interface UseUpdateColumnDefaultProps {
    column: Omit<BaseTableColumnMetadataDto, "table">;
    schemaName: string;
    tableName: string;
    onSuccess?: (column: BaseTableColumnMetadataDto) => void;
    onError?: (error: string) => void;
}

export function useUpdateColumnDefaultForm({
    column,
    schemaName,
    tableName,
    onSuccess,
    onError,
}: UseUpdateColumnDefaultProps) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<UpdateColumnDefaultSchema>({
        resolver: zodResolver(updateColumnDefaultSchema),
        defaultValues: {
            schemaName,
            tableName,
            columnName: column.columnName,
            columnDefault: column.columnDefault || "",
            dataType: column.dataType.toUpperCase() as DataType,
            characterMaxLength: column.characterMaxLength || undefined,
            numericPrecision: column.numericPrecision || undefined,
            numericScale: column.numericScale || undefined,
            isUnique: column.isUnique,
        },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        form.reset({
            schemaName,
            tableName,
            columnName: column.columnName,
            columnDefault: column.columnDefault || "",
            dataType: column.dataType.toUpperCase() as DataType,
            characterMaxLength: column.characterMaxLength || undefined,
            numericPrecision: column.numericPrecision || undefined,
            numericScale: column.numericScale || undefined,
            isUnique: column.isUnique,
        });
        setSubmitError(null);
        form.clearErrors();
    }, [form, column, schemaName, tableName]);

    const submitDefaultUpdate = useCallback(
        async (data: UpdateColumnDefaultSchema) => {
            setSubmitError(null);
            form.clearErrors();

            startTransition(async () => {
                try {
                    const result = await updateColumnDefault(undefined, data);

                    if (result.success && result.data) {
                        toast.success(result.message || "Column default value updated successfully");
                        onSuccess?.(result.data);
                        resetForm();
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    if (field in form.getValues()) {
                                        form.setError(field as keyof UpdateColumnDefaultSchema, {
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
        submitDefaultUpdate,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}

// Hook for primary key toggle
interface UseUpdateColumnPrimaryKeyProps {
    schemaName: string;
    tableName: string;
    columns: Omit<BaseTableColumnMetadataDto, "table">[];
    onSuccess?: (columns: BaseTableColumnMetadataDto[]) => void;
    onError?: (error: string) => void;
}

export function useUpdateColumnPrimaryKeyForm({
    schemaName,
    tableName,
    columns,
    onSuccess,
    onError,
}: UseUpdateColumnPrimaryKeyProps) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<UpdateColumnPrimaryKeySchema>({
        resolver: zodResolver(updateColumnPrimaryKeySchema),
        defaultValues: {
            schemaName: schemaName,
            tableName: tableName,
            columnNames: [],
            isPrimaryKey: true,
            force: undefined,
        },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        form.reset({
            schemaName: schemaName,
            tableName: tableName,
            columnNames: [],
            isPrimaryKey: true,
            force: undefined,
        });
        setSubmitError(null);
        form.clearErrors();
    }, [form, schemaName, tableName]);

    const submitPrimaryKeyUpdate = useCallback(
        async (data: UpdateColumnPrimaryKeySchema) => {
            setSubmitError(null);
            form.clearErrors();

            startTransition(async () => {
                try {
                    const result = await updateColumnPrimaryKey(undefined, data);

                    if (result.success && result.data) {
                        toast.success(result.message || "Primary key updated successfully");
                        onSuccess?.(result.data);
                        resetForm();
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    if (field in form.getValues()) {
                                        form.setError(field as keyof UpdateColumnPrimaryKeySchema, {
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
        submitPrimaryKeyUpdate,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
        availableColumns: columns.map(col => col.columnName),
    };
}

// Hook for foreign key toggle
interface UseUpdateColumnForeignKeyProps {
    column: Omit<BaseTableColumnMetadataDto, "table">;
    schemaName: string;
    tableName: string;
    onSuccess?: (column: BaseTableColumnMetadataDto) => void;
    onError?: (error: string) => void;
}

export function useUpdateColumnForeignKeyForm({
    column,
    schemaName,
    tableName,
    onSuccess,
    onError,
}: UseUpdateColumnForeignKeyProps) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const hasForeignKey = column.columnType === ColumnType.FOREIGN_KEY || column.columnType === ColumnType.PRIMARY_KEY_FOREIGN_KEY;

    const form = useForm<UpdateColumnForeignKeySchema>({
        resolver: zodResolver(updateColumnForeignKeySchema),
        defaultValues: {
            schemaName,
            tableName,
            columnName: column.columnName,
            isForeignKey: hasForeignKey,
            referencedSchemaName: "referencedSchemaName" in column ? column.referencedSchemaName as string : undefined,
            referencedTableName: "referencedTableName" in column ? column.referencedTableName as string : undefined,
            referencedColumnName: "referencedColumnName" in column ? column.referencedColumnName as string : undefined,
            onUpdateAction: "onUpdateAction" in column ? column.onUpdateAction as FKOnAction : undefined,
            onDeleteAction: "onDeleteAction" in column ? column.onDeleteAction as FKOnAction : undefined,
        },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        form.reset({
            schemaName,
            tableName,
            columnName: column.columnName,
            isForeignKey: hasForeignKey,
            referencedSchemaName: "referencedSchemaName" in column ? column.referencedSchemaName as string : undefined,
            referencedTableName: "referencedTableName" in column ? column.referencedTableName as string : undefined,
            referencedColumnName: "referencedColumnName" in column ? column.referencedColumnName as string : undefined,
            onUpdateAction: "onUpdateAction" in column ? column.onUpdateAction as FKOnAction : undefined,
            onDeleteAction: "onDeleteAction" in column ? column.onDeleteAction as FKOnAction : undefined,
        });
        setSubmitError(null);
        form.clearErrors();
    }, [form, column, schemaName, tableName, hasForeignKey]);

    const submitForeignKeyUpdate = useCallback(
        async (data: UpdateColumnForeignKeySchema) => {
            setSubmitError(null);
            form.clearErrors();

            startTransition(async () => {
                try {
                    const result = await updateColumnForeignKey(undefined, data);

                    if (result.success && result.data) {
                        toast.success(result.message || "Foreign key constraint updated successfully");
                        onSuccess?.(result.data);
                        resetForm();
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    if (field in form.getValues()) {
                                        form.setError(field as keyof UpdateColumnForeignKeySchema, {
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

    const submitForeignKeyRemoval = useCallback(
        async () => {
            const formData: UpdateColumnForeignKeySchema = {
                schemaName,
                tableName,
                columnName: column.columnName,
                isForeignKey: false,
            };

            setSubmitError(null);

            startTransition(async () => {
                try {
                    const result = await updateColumnForeignKey(undefined, formData);

                    if (result.success && result.data) {
                        toast.success(result.message || "Foreign key constraint removed successfully");
                        onSuccess?.(result.data);
                        resetForm();
                    } else {
                        const errorMessage = result.message || "Failed to remove foreign key constraint";
                        setSubmitError(errorMessage);
                        toast.error(errorMessage);
                        onError?.(errorMessage);
                    }
                } catch (error) {
                    const errorMessage =
                        error instanceof Error ? error.message : "An unexpected error occurred";
                    setSubmitError(errorMessage);
                    toast.error(errorMessage);
                    onError?.(errorMessage);
                }
            });
        },
        [column, schemaName, tableName, onSuccess, onError, resetForm]
    );

    return {
        form,
        isPending,
        submitError,
        submitForeignKeyUpdate,
        submitForeignKeyRemoval,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
        hasForeignKey: hasForeignKey,
    };
}
