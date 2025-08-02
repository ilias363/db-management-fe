"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { apiClient } from "../api-client";
import type { NewUserDto, PaginationParams, UpdateUserDto } from "../types";
import { HttpError } from "../errors";
import { createUserSchema, updateUserSchema } from "../schemas";

export async function createUser(prevState: unknown, formData: FormData) {
    const formObject = Object.fromEntries(formData);

    const roleIds = formData.getAll("roleIds").map(id => parseInt(id as string, 10));
    const userData: NewUserDto = {
        username: formObject.username as string,
        password: formObject.password as string,
        roles: roleIds,
        active: formObject.active === "true",
    };

    const result = createUserSchema.safeParse(userData);

    if (!result.success) {
        return {
            success: false,
            errors: z.flattenError(result.error).fieldErrors
        };
    }

    try {
        const response = await apiClient.users.createUser(result.data);

        if (!response.success) {
            return {
                success: false,
                errors: { general: [response.message] }
            };
        }

        revalidatePath("/admin/users");
        return {
            success: true,
            message: "User created successfully",
            data: response.data
        };
    } catch (error) {
        if (error instanceof HttpError) {
            return {
                success: false,
                errors: { general: [error.message] }
            };
        }
        console.error('Unexpected error during user creation:', error);
        return {
            success: false,
            errors: { general: ["An unexpected error occurred"] }
        };
    }
}

export async function updateUser(prevState: unknown, formData: FormData) {
    const formObject = Object.fromEntries(formData);

    const roleIds = formData.getAll("roleIds");
    const userData: UpdateUserDto = {
        id: parseInt(formObject.id as string, 0),
        username: formObject.username as string,
        roles: roleIds.map(id => parseInt(id as string, 10)),
        active: formObject.active === "true",
    };

    const result = updateUserSchema.safeParse(userData);

    if (!result.success) {
        return {
            success: false,
            errors: z.flattenError(result.error).fieldErrors
        };
    }

    try {
        const response = await apiClient.users.updateUser(result.data);

        if (!response.success) {
            return {
                success: false,
                errors: { general: [response.message] }
            };
        }

        revalidatePath("/admin/users");
        return {
            success: true,
            message: "User updated successfully",
            data: response.data
        };
    } catch (error) {
        if (error instanceof HttpError) {
            return {
                success: false,
                errors: { general: [error.message] }
            };
        }
        console.error('Unexpected error during user update:', error);
        return {
            success: false,
            errors: { general: ["An unexpected error occurred"] }
        };
    }
}

export async function toggleUserStatus(userId: number, currentStatus: boolean) {
    try {
        const response = currentStatus
            ? await apiClient.users.deactivateUser(userId)
            : await apiClient.users.activateUser(userId);

        if (!response.success) {
            return {
                success: false,
                message: response.message || "Failed to update user status"
            };
        }

        revalidatePath("/admin/users");
        return {
            success: true,
            message: `User ${currentStatus ? "deactivated" : "activated"} successfully`
        };
    } catch (error) {
        if (error instanceof HttpError) {
            return {
                success: false,
                message: error.message
            };
        }
        console.error('Unexpected error during user status toggle:', error);
        return {
            success: false,
            message: "An unexpected error occurred"
        };
    }
}

export async function getUsersData(params: PaginationParams & { search?: string; activeOnly?: boolean }) {
    try {
        const queryParams: Record<string, string> = {
            page: (params.page || 0).toString(),
            size: (params.size || 10).toString(),
            sortBy: params.sortBy || "username",
            sortDirection: params.sortDirection || "ASC",
        };

        if (params.search) {
            queryParams.search = params.search;
        }

        const usersResponse = params.activeOnly
            ? await apiClient.users.getAllActiveUsers(queryParams)
            : await apiClient.users.getAllUsers(queryParams);

        const [rolesResponse, statsResponse] = await Promise.all([
            apiClient.roles.getAllRoles(),
            apiClient.users.getUserStats(),
        ]);

        return {
            success: true,
            data: {
                users: usersResponse.success ? usersResponse.data : null,
                roles: rolesResponse.success ? rolesResponse.data : null,
                stats: statsResponse.success ? statsResponse.data : null,
            }
        };
    } catch (error) {
        console.error('Failed to load users data:', error);
        return {
            success: false,
            message: "Failed to load users data"
        };
    }
}
