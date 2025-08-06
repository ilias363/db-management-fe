"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { apiClient } from "@/lib/api-client";
import type {
    RoleDto,
    NewRoleDto,
    UpdateRoleDto,
    PaginationParams,
    RolePageDto,
    RoleStats,
    PermissionDetailDto,
    ActionState
} from "@/lib/types";
import { HttpError } from "../errors";
import { createRoleSchema, updateRoleSchema } from "../schemas";

export interface DeleteRoleResponse {
    success: boolean;
    message: string;
}

export interface RolesDataParams extends PaginationParams {
    search?: string;
}

export interface RolesDataResponse {
    success: boolean;
    data?: {
        roles?: RolePageDto | null;
        stats?: RoleStats | null;
    };
    message?: string;
}

export interface AllRolesResponse {
    success: boolean;
    data?: RoleDto[];
    message?: string;
}

export async function getRolesData(params: RolesDataParams = {}): Promise<RolesDataResponse> {
    try {
        const queryParams: Record<string, string> = {
            page: (params.page || 0).toString(),
            size: (params.size || 10).toString(),
            sortBy: params.sortBy || "name",
            sortDirection: params.sortDirection || "ASC",
        };

        if (params.search) {
            queryParams.search = params.search;
        }

        const [rolesResponse, statsResponse] = await Promise.all([
            apiClient.roles.getAllRolesPaginated(queryParams),
            apiClient.roles.getRoleStats(),
        ]);

        return {
            success: true,
            data: {
                roles: rolesResponse.success ? rolesResponse.data : null,
                stats: statsResponse.success ? statsResponse.data : null,
            }
        };
    } catch (error) {
        console.error('Failed to fetch roles data:', error);
        return {
            success: false,
            message: "Failed to load users data",
        };
    }
}

export async function getAllRoles(): Promise<AllRolesResponse> {
    try {
        const response = await apiClient.roles.getAllRoles();

        if (!response.success) {
            return {
                success: false,
                message:response.message || "Failed to fetch roles",
            };
        }

        return {
            success: true,
            data: response.data || [],
            message: "Roles fetched successfully"
        };
    } catch (error) {
        console.error('Failed to fetch all roles:', error);
        return {
            success: false,
            message: "Failed to load users data",
        };
    }
}

export async function createRole(prevState: ActionState<RoleDto> | undefined, formData: FormData): Promise<ActionState<RoleDto>> {
    const formObject = Object.fromEntries(formData);

    const permissions = formData.getAll("permissions").map((perm) => {
        const parsed = JSON.parse(perm as string);
        return {
            schemaName: parsed.schemaName || null,
            tableName: parsed.tableName || null,
            viewName: parsed.viewName || null,
            permissionType: parsed.permissionType,
        } as PermissionDetailDto;
    });

    const roleData: NewRoleDto = {
        name: formObject.name as string,
        description: formObject.description as string,
        permissions: permissions,
    };

    const result = createRoleSchema.safeParse(roleData);

    if (!result.success) {
        return {
            success: false,
            errors: z.flattenError(result.error).fieldErrors
        };
    }

    try {
        // Transform schema result to match API expectations (undefined -> null)
        const transformedData: NewRoleDto = {
            ...result.data,
            permissions: result.data.permissions.map(p => ({
                schemaName: p.schemaName ?? null,
                tableName: p.tableName ?? null,
                viewName: p.viewName ?? null,
                permissionType: p.permissionType,
            }))
        };

        const response = await apiClient.roles.createRole(transformedData);

        if (!response.success) {
            return {
                success: false,
                errors: { general: response.message.split("\n") }
            };
        }

        revalidatePath("/admin/roles");
        return {
            success: true,
            message: "Role created successfully",
            data: response.data
        };
    } catch (error) {
        if (error instanceof HttpError) {
            return {
                success: false,
                errors: { general: [error.message] }
            };
        }
        console.error('Unexpected error during role creation:', error);
        return {
            success: false,
            errors: { general: ["An unexpected error occurred"] }
        };
    }
}

export async function updateRole(prevState: ActionState<RoleDto> | undefined, formData: FormData): Promise<ActionState<RoleDto>> {
    const formObject = Object.fromEntries(formData);

    const permissions = formData.getAll("permissions").map((perm) => {
        const parsed = JSON.parse(perm as string);
        return {
            schemaName: parsed.schemaName || null,
            tableName: parsed.tableName || null,
            viewName: parsed.viewName || null,
            permissionType: parsed.permissionType,
        } as PermissionDetailDto;
    });

    const roleData: UpdateRoleDto = {
        id: parseInt(formObject.id as string, 10),
        name: formObject.name as string,
        description: formObject.description as string,
        permissions: permissions,
    };

    const result = updateRoleSchema.safeParse(roleData);

    if (!result.success) {
        return {
            success: false,
            errors: z.flattenError(result.error).fieldErrors
        };
    }

    try {
        // Transform schema result to match API expectations (undefined -> null)
        const transformedData: UpdateRoleDto = {
            ...result.data,
            permissions: result.data.permissions.map(p => ({
                schemaName: p.schemaName ?? null,
                tableName: p.tableName ?? null,
                viewName: p.viewName ?? null,
                permissionType: p.permissionType,
            }))
        };

        const response = await apiClient.roles.updateRole(transformedData);

        if (!response.success) {
            return {
                success: false,
                errors: { general: response.message.split("\n") }
            };
        }

        revalidatePath("/admin/roles");
        return {
            success: true,
            message: "Role updated successfully",
            data: response.data
        };
    } catch (error) {
        if (error instanceof HttpError) {
            return {
                success: false,
                errors: { general: [error.message] }
            };
        }
        console.error('Unexpected error during role update:', error);
        return {
            success: false,
            errors: { general: ["An unexpected error occurred"] }
        };
    }
}

export async function deleteRole(roleId: number): Promise<DeleteRoleResponse> {
    try {
        const response = await apiClient.roles.deleteRole(roleId);

        if (!response.success) {
            return {
                success: false,
                message: response.message || "Failed to delete role"
            };
        }

        revalidatePath("/admin/roles");
        return {
            success: true,
            message: "Role deleted successfully"
        };
    } catch (error) {
        if (error instanceof HttpError) {
            return {
                success: false,
                message: error.message
            };
        }
        console.error('Unexpected error during role deletion:', error);
        return {
            success: false,
            message: "An unexpected error occurred"
        };
    }
}
