"use client";

import { useState, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    createStandardColumn,
    createPrimaryKeyColumn,
    createForeignKeyColumn,
} from "@/lib/actions/database";
import {
    standardColumnSchema,
    primaryKeyColumnSchema,
    foreignKeyColumnSchema,
    StandardColumnSchema,
    PrimaryKeyColumnSchema,
    ForeignKeyColumnSchema,
} from "@/lib/schemas/database";
import { ColumnType, DataType } from "@/lib/types";
import {
    NewForeignKeyColumnDto,
    NewPrimaryKeyColumnDto,
    NewStandardColumnDto,
} from "../types/database";

interface BaseColumnFormProps {
    schemaName: string;
    tableName: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

type StandaloneStandardColumnData = NewStandardColumnDto;

type StandalonePrimaryKeyColumnData = NewPrimaryKeyColumnDto;

type StandaloneForeignKeyColumnData = NewForeignKeyColumnDto;

// STANDARD COLUMN FORM HOOK
export function useStandardColumnForm({
    schemaName,
    tableName,
    onSuccess,
    onError,
}: BaseColumnFormProps) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<StandardColumnSchema>({
        resolver: zodResolver(standardColumnSchema),
        defaultValues: {
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

    const resetForm = useCallback(() => {
        form.reset({
            columnName: "",
            columnType: ColumnType.STANDARD,
            dataType: DataType.VARCHAR,
            characterMaxLength: undefined,
            numericPrecision: undefined,
            numericScale: undefined,
            isNullable: true,
            isUnique: false,
            columnDefault: undefined,
        });
        setSubmitError(null);
        form.clearErrors();
    }, [form]);

    const submitColumn = useCallback(
        async (data: StandardColumnSchema) => {
            setSubmitError(null);
            form.clearErrors();

            // Add schema and table name to the data
            const standaloneData: StandaloneStandardColumnData = {
                ...data,
                schemaName,
                tableName,
            };

            startTransition(async () => {
                try {
                    const result = await createStandardColumn(undefined, standaloneData);

                    if (result.success) {
                        toast.success(result.message || "Standard column created successfully");
                        onSuccess?.();
                        resetForm();
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    if (field in form.getValues()) {
                                        form.setError(field as keyof StandardColumnSchema, {
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

                        onError?.(result.message || "Failed to create column");
                    }
                } catch (error) {
                    console.error("Error creating standard column:", error);
                    const errorMessage = "An unexpected error occurred. Please try again.";
                    setSubmitError(errorMessage);
                    onError?.(errorMessage);
                }
            });
        },
        [form, schemaName, tableName, onSuccess, onError, resetForm]
    );

    return {
        form,
        isPending,
        submitError,
        submitColumn,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}

// PRIMARY KEY COLUMN FORM HOOK
export function usePrimaryKeyColumnForm({
    schemaName,
    tableName,
    onSuccess,
    onError,
}: BaseColumnFormProps) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<PrimaryKeyColumnSchema>({
        resolver: zodResolver(primaryKeyColumnSchema),
        defaultValues: {
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

    const resetForm = useCallback(() => {
        form.reset({
            columnName: "",
            columnType: ColumnType.PRIMARY_KEY,
            dataType: DataType.INT,
            characterMaxLength: undefined,
            numericPrecision: undefined,
            numericScale: undefined,
            autoIncrement: false,
        });
        setSubmitError(null);
        form.clearErrors();
    }, [form]);

    const submitColumn = useCallback(
        async (data: PrimaryKeyColumnSchema) => {
            setSubmitError(null);
            form.clearErrors();

            // Add schema and table name to the data
            const standaloneData: StandalonePrimaryKeyColumnData = {
                ...data,
                schemaName,
                tableName,
            };

            startTransition(async () => {
                try {
                    const result = await createPrimaryKeyColumn(undefined, standaloneData);

                    if (result.success) {
                        toast.success(result.message || "Primary key column created successfully");
                        onSuccess?.();
                        resetForm();
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    if (field in form.getValues()) {
                                        form.setError(field as keyof PrimaryKeyColumnSchema, {
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

                        onError?.(result.message || "Failed to create column");
                    }
                } catch (error) {
                    console.error("Error creating primary key column:", error);
                    const errorMessage = "An unexpected error occurred. Please try again.";
                    setSubmitError(errorMessage);
                    onError?.(errorMessage);
                }
            });
        },
        [form, schemaName, tableName, onSuccess, onError, resetForm]
    );

    return {
        form,
        isPending,
        submitError,
        submitColumn,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}

// FOREIGN KEY COLUMN FORM HOOK
export function useForeignKeyColumnForm({
    schemaName,
    tableName,
    onSuccess,
    onError,
}: BaseColumnFormProps) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<ForeignKeyColumnSchema>({
        resolver: zodResolver(foreignKeyColumnSchema),
        defaultValues: {
            columnName: "",
            columnType: ColumnType.FOREIGN_KEY,
            dataType: DataType.INT,
            characterMaxLength: undefined,
            numericPrecision: undefined,
            numericScale: undefined,
            isNullable: true,
            referencedSchemaName: "",
            referencedTableName: "",
            referencedColumnName: "",
            onDeleteAction: undefined,
            onUpdateAction: undefined,
            columnDefault: undefined,
        },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        form.reset({
            columnName: "",
            columnType: ColumnType.FOREIGN_KEY,
            dataType: DataType.INT,
            characterMaxLength: undefined,
            numericPrecision: undefined,
            numericScale: undefined,
            isNullable: true,
            referencedSchemaName: "",
            referencedTableName: "",
            referencedColumnName: "",
            onDeleteAction: undefined,
            onUpdateAction: undefined,
            columnDefault: undefined,
        });
        setSubmitError(null);
        form.clearErrors();
    }, [form]);

    const submitColumn = useCallback(
        async (data: ForeignKeyColumnSchema) => {
            setSubmitError(null);
            form.clearErrors();

            // Add schema and table name to the data
            const standaloneData: StandaloneForeignKeyColumnData = {
                ...data,
                schemaName,
                tableName,
            };

            startTransition(async () => {
                try {
                    const result = await createForeignKeyColumn(undefined, standaloneData);

                    if (result.success) {
                        toast.success(result.message || "Foreign key column created successfully");
                        onSuccess?.();
                        resetForm();
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    if (field in form.getValues()) {
                                        form.setError(field as keyof ForeignKeyColumnSchema, {
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

                        onError?.(result.message || "Failed to create column");
                    }
                } catch (error) {
                    console.error("Error creating foreign key column:", error);
                    const errorMessage = "An unexpected error occurred. Please try again.";
                    setSubmitError(errorMessage);
                    onError?.(errorMessage);
                }
            });
        },
        [form, schemaName, tableName, onSuccess, onError, resetForm]
    );

    return {
        form,
        isPending,
        submitError,
        submitColumn,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}
