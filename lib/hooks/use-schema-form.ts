"use client";

import { useState, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSchema } from "@/lib/actions/database/schema";
import { createSchemaSchema, CreateSchemaSchema } from "@/lib/schemas/database/schema";
import { SchemaMetadataDto } from "@/lib/types/database";
import { toast } from "sonner";

export function useCreateSchemaForm(onSuccess?: (schema?: SchemaMetadataDto) => void, onError?: (error: string) => void) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<CreateSchemaSchema>({
        resolver: zodResolver(createSchemaSchema),
        defaultValues: {
            schemaName: "",
        },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        form.reset({
            schemaName: "",
        });
        setSubmitError(null);
        form.clearErrors();
    }, [form]);

    const submitSchema = useCallback(
        async (data: CreateSchemaSchema) => {
            setSubmitError(null);
            form.clearErrors();

            startTransition(async () => {
                try {
                    const result = await createSchema(undefined, data);

                    if (result.success) {
                        toast.success(result.message || "Schema created successfully");
                        onSuccess?.(result.data);
                        resetForm();
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    if (field in form.getValues()) {
                                        form.setError(field as keyof CreateSchemaSchema, {
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
                    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
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
        submitSchema,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}
