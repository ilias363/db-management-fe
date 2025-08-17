"use client";

import { useState, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createIndex } from "@/lib/actions/database";
import { IndexMetadataDto } from "@/lib/types/database";
import { CreateIndexSchema, createIndexSchema } from "@/lib/schemas/database";
import { toast } from "sonner";
import { IndexType } from "../types";

interface UseCreateIndexProps {
    onSuccess?: (index?: IndexMetadataDto) => void;
    onError?: (error: string) => void;
    schemaName: string;
    tableName: string;
}

export function useCreateIndexForm({
    onSuccess,
    onError,
    schemaName,
    tableName,
}: UseCreateIndexProps) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<CreateIndexSchema>({
        resolver: zodResolver(createIndexSchema),
        defaultValues: {
            schemaName,
            tableName,
            indexName: "",
            indexType: IndexType.BTREE,
            isUnique: false,
            indexColumns: [],
        },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        form.reset({
            schemaName,
            tableName,
            indexName: "",
            indexType: IndexType.BTREE,
            isUnique: false,
            indexColumns: [],
        });
        setSubmitError(null);
        form.clearErrors();
    }, [form, schemaName, tableName]);

    const submitIndex = useCallback(
        async (data: CreateIndexSchema) => {
            setSubmitError(null);
            form.clearErrors();

            startTransition(async () => {
                try {
                    const result = await createIndex(undefined, data);

                    if (result.success) {
                        toast.success(result.message || "Index created successfully");
                        onSuccess?.(result.data);
                        resetForm();
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    form.setError(field as keyof CreateIndexSchema, {
                                        type: "server",
                                        message: Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors,
                                    });
                                }
                            });
                        }

                        if (result.message && !result.errors) {
                            setSubmitError(result.message);
                        }

                        onError?.(result.message || "Failed to create index");
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

    return {
        form,
        isPending,
        submitError,
        submitIndex,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}
