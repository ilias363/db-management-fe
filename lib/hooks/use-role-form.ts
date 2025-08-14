"use client";

import { useState, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRole, updateRole } from "@/lib/actions/role";
import { createRoleSchema, updateRoleSchema, CreateRoleFormData, UpdateRoleFormData } from "@/lib/schemas/role";
import { RoleDto } from "@/lib/types";
import { toast } from "sonner";

export function useRoleForm(
    isCreateMode: boolean,
    role?: RoleDto,
    onSuccess?: (role?: RoleDto) => void,
    onError?: (error: string) => void
) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const schema = isCreateMode ? createRoleSchema : updateRoleSchema;

    const form = useForm<CreateRoleFormData | UpdateRoleFormData>({
        resolver: zodResolver(schema),
        defaultValues: isCreateMode
            ? {
                name: "",
                description: "",
                permissions: [],
            }
            : {
                id: role?.id || 0,
                name: role?.name || "",
                description: role?.description || "",
                permissions: role?.permissions || [],
            },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        if (isCreateMode) {
            form.reset({
                name: "",
                description: "",
                permissions: [],
            });
        } else {
            form.reset({
                id: role?.id || 0,
                name: role?.name || "",
                description: role?.description || "",
                permissions: role?.permissions || [],
            });
        }
        setSubmitError(null);
        form.clearErrors();
    }, [form, isCreateMode, role]);

    const submitRole = useCallback(
        async (data: CreateRoleFormData | UpdateRoleFormData) => {
            setSubmitError(null);
            form.clearErrors();

            startTransition(async () => {
                try {
                    const result = isCreateMode
                        ? await createRole(undefined, data)
                        : await updateRole(undefined, data as UpdateRoleFormData);

                    if (result.success) {
                        toast.success(result.message || `Role ${isCreateMode ? "created" : "updated"} successfully`);
                        onSuccess?.(result.data);
                        if (isCreateMode) {
                            resetForm();
                        }
                    } else {
                        if (result.errors) {
                            Object.entries(result.errors).forEach(([field, fieldErrors]) => {
                                if (field === "root") {
                                    setSubmitError(Array.isArray(fieldErrors) ? fieldErrors.join(", ") : fieldErrors);
                                } else {
                                    const errorMessage = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
                                    if (field in form.getValues()) {
                                        form.setError(field as keyof (CreateRoleFormData | UpdateRoleFormData), {
                                            type: "server",
                                            message: errorMessage,
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
        [form, onSuccess, onError, resetForm, isCreateMode]
    );

    return {
        form,
        isPending,
        submitError,
        submitRole,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}
