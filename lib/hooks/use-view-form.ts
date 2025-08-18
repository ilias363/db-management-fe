import { useCallback, useState, useTransition } from "react";
import { ViewMetadataDto } from "../types/database";
import { renameViewSchema, RenameViewSchema } from "../schemas/database";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { renameView } from "../actions/database";
import { toast } from "sonner";

interface UseRenameViewProps {
    onSuccess?: (View: ViewMetadataDto) => void;
    onError?: (error: string) => void;
    view: ViewMetadataDto;
}

export function useRenameViewForm({ onSuccess, onError, view }: UseRenameViewProps) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<RenameViewSchema>({
        resolver: zodResolver(renameViewSchema),
        defaultValues: {
            schemaName: view.schema.schemaName,
            viewName: view.viewName,
            updatedViewName: view.viewName,
        },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        form.reset({
            schemaName: view.schema.schemaName,
            viewName: view.viewName,
            updatedViewName: view.viewName,
        });
        setSubmitError(null);
        form.clearErrors();
    }, [form, view]);

    const submitView = useCallback(
        async (data: RenameViewSchema) => {
            setSubmitError(null);
            form.clearErrors();

            startTransition(async () => {
                try {
                    const result = await renameView(undefined, data);

                    if (result.success && result.data) {
                        toast.success(result.message || "View renamed successfully");
                        onSuccess?.(result.data);
                        resetForm();
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    if (field in form.getValues()) {
                                        form.setError(field as keyof RenameViewSchema, {
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
        submitView,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}
