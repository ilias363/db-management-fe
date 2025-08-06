"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { apiClient } from "../api-client";
import type {
    UserDto,
    NewUserDto,
    UpdateUserDto,
    PaginationParams,
    UserPageDto,
    UserStats,
    ActionState,
    RolePageDto,
    AuditLogPageDto
} from "../types";
import { HttpError } from "../errors";
import { createUserSchema, updateUserSchema } from "../schemas";

export interface UsersDataParams extends PaginationParams {
    search?: string;
    activeOnly?: boolean;
}

export interface UsersDataResponse {
    success: boolean;
    data?: {
        users?: UserPageDto | null;
        roles?: RolePageDto | null;
        stats?: UserStats | null;
    };
    message?: string;
}

export interface ToggleUserStatusResponse {
    success: boolean;
    message: string;
}

export interface GetUserByIdResponse {
    success: boolean;
    data?: UserDto | null;
    message?: string;
}

export interface GetUserAuditLogsResponse {
    success: boolean;
    data?: AuditLogPageDto | null;
    message?: string;
}

export async function getUsersData(params: UsersDataParams = {}): Promise<UsersDataResponse> {
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

export async function createUser(prevState: ActionState<UserDto> | undefined, formData: FormData): Promise<ActionState<UserDto>> {
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
                errors: { general: response.message.split("\n") }
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

export async function updateUser(prevState: ActionState<UserDto> | undefined, formData: FormData): Promise<ActionState<UserDto>> {
    const formObject = Object.fromEntries(formData);

    const roleIds = formData.getAll("roleIds");
    const userData: UpdateUserDto = {
        id: parseInt(formObject.id as string, 10),
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
                errors: { general: response.message.split("\n") }
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

export async function toggleUserStatus(userId: number, currentStatus: boolean): Promise<ToggleUserStatusResponse> {
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

export async function getUserById(userId: number): Promise<GetUserByIdResponse> {
    try {
        const response = await apiClient.users.getUserById(userId);

        if (!response.success) {
            return {
                success: false,
                message: response.message || "Failed to fetch user"
            };
        }

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        if (error instanceof HttpError) {
            return {
                success: false,
                message: error.message
            };
        }
        console.error('Unexpected error fetching user:', error);
        return {
            success: false,
            message: "An unexpected error occurred"
        };
    }
}

export async function getUserAuditLogs(userId: number, params: PaginationParams = {}): Promise<GetUserAuditLogsResponse> {
    try {
        const response = await apiClient.audit.getAuditLogsByUserId(userId, params);

        if (!response.success) {
            return {
                success: false,
                message: response.message || "Failed to fetch user audit logs"
            };
        }

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        if (error instanceof HttpError) {
            return {
                success: false,
                message: error.message
            };
        }
        console.error('Unexpected error fetching user audit logs:', error);
        return {
            success: false,
            message: "An unexpected error occurred"
        };
    }
}
