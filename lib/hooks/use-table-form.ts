"use client";

import { useState, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTable } from "@/lib/actions/database";
import { TableMetadataDto } from "@/lib/types/database";
import { CreateTableSchema, createTableSchema } from "@/lib/schemas/database";
import { toast } from "sonner";

interface UseCreateTableProps {
    onSuccess?: (table: TableMetadataDto) => void;
    onError?: (error: string) => void;
}

export function useCreateTableForm({ onSuccess, onError }: UseCreateTableProps = {}) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<CreateTableSchema>({
        resolver: zodResolver(createTableSchema),
        defaultValues: {
            schemaName: "",
            tableName: "",
            standardColumns: [],
            primaryKeyColumns: [],
            foreignKeyColumns: [],
            primaryKeyForeignKeyColumns: [],
        },
        mode: "onChange",
    });

    const resetForm = useCallback(
        (schemaName?: string) => {
            form.reset({
                schemaName: schemaName || "",
                tableName: "",
                standardColumns: [],
                primaryKeyColumns: [],
                foreignKeyColumns: [],
                primaryKeyForeignKeyColumns: [],
            });
            setSubmitError(null);
            form.clearErrors();
        },
        [form]
    );

    const submitTable = useCallback(
        async (data: CreateTableSchema) => {
            setSubmitError(null);
            form.clearErrors();

            startTransition(async () => {
                try {
                    const result = await createTable(undefined, data);

                    if (result.success && result.data) {
                        toast.success(result.message || "Table created successfully");
                        onSuccess?.(result.data);
                        resetForm(data.schemaName);
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    form.setError(field as keyof CreateTableSchema, {
                                        type: "server",
                                        message: Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors,
                                    });
                                }
                            });
                        }

                        // Handle general server message
                        if (result.message && !result.errors) {
                            setSubmitError(result.message);
                        }

                        onError?.(result.message || "Failed to create table");
                    }
                } catch (error) {
                    console.error("Unexpected error:", error);
                    const errorMessage = "An unexpected error occurred. Please try again.";
                    setSubmitError(errorMessage);
                    onError?.(errorMessage);
                }
            });
        },
        [form, onSuccess, onError, resetForm]
    );

    const getColumnSummary = useCallback(() => {
        const values = form.getValues();
        return [
            ...values.standardColumns,
            ...values.primaryKeyColumns,
            ...values.foreignKeyColumns,
            ...values.primaryKeyForeignKeyColumns,
        ];
    }, [form]);

    return {
        form,
        isPending,
        submitError,
        submitTable,
        resetForm,
        getColumnSummary,
        // Expose form state for convenience
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}
