"use client";

import { useState, useTransition, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUser, updateUser } from "@/lib/actions/user";
import { createUserSchema, updateUserSchema, CreateUserFormData, UpdateUserFormData } from "@/lib/schemas/user";
import { UserDto } from "@/lib/types";
import { toast } from "sonner";

export function useUserForm(
    isCreateMode: boolean,
    user?: UserDto,
    onSuccess?: (user?: UserDto) => void,
    onError?: (error: string) => void
) {
    const [isPending, startTransition] = useTransition();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const schema = isCreateMode ? createUserSchema : updateUserSchema;

    const form = useForm<CreateUserFormData | UpdateUserFormData>({
        resolver: zodResolver(schema),
        defaultValues: isCreateMode
            ? {
                username: "",
                password: "",
                active: true,
                roles: [],
            }
            : {
                id: user?.id || 0,
                username: user?.username || "",
                active: user?.active ?? true,
                roles: user?.roles?.map(r => r.id) || [],
            },
        mode: "onChange",
    });

    const resetForm = useCallback(() => {
        if (isCreateMode) {
            form.reset({
                username: "",
                password: "",
                active: true,
                roles: [],
            });
        } else {
            form.reset({
                id: user?.id || 0,
                username: user?.username || "",
                active: user?.active ?? true,
                roles: user?.roles?.map(r => r.id) || [],
            });
        }
        setSubmitError(null);
        form.clearErrors();
    }, [form, isCreateMode, user]);

    const submitUser = useCallback(
        async (data: CreateUserFormData | UpdateUserFormData) => {
            setSubmitError(null);
            form.clearErrors();

            startTransition(async () => {
                try {
                    const result = isCreateMode
                        ? await createUser(undefined, data as CreateUserFormData)
                        : await updateUser(undefined, data as UpdateUserFormData);

                    if (result.success) {
                        toast.success(result.message || `User ${isCreateMode ? "created" : "updated"} successfully`);
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
                                        form.setError(field as keyof (CreateUserFormData | UpdateUserFormData), {
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
        submitUser,
        resetForm,
        isValid: form.formState.isValid,
        isDirty: form.formState.isDirty,
        errors: form.formState.errors,
    };
}
