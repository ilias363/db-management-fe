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
    ActionState
} from "@/lib/types";
import { HttpError } from "../errors";
import { CreateRoleFormData, createRoleSchema, UpdateRoleFormData, updateRoleSchema } from "../schemas";
import { withAdminAuth } from "./auth-utils";

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

export interface RoleByIdResponse {
    success: boolean;
    data?: RoleDto;
    message?: string;
}

export interface RoleUsersResponse {
    success: boolean;
    data?: import("@/lib/types").UserPageDto;
    message?: string;
}

export async function getRolesData(params: RolesDataParams = {}): Promise<RolesDataResponse> {
    const authAction = await withAdminAuth(async (params: RolesDataParams = {}): Promise<RolesDataResponse> => {
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
                message: "Failed to load roles data",
            };
        }
    });

    return authAction(params);
}

export async function getAllRoles(): Promise<AllRolesResponse> {
    const authAction = await withAdminAuth(async (): Promise<AllRolesResponse> => {
        try {
            const response = await apiClient.roles.getAllRoles();

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to fetch roles",
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
                message: "Failed to load roles data",
            };
        }
    });

    return authAction();
}

export async function getRoleById(roleId: number): Promise<RoleByIdResponse> {
    const authAction = await withAdminAuth(async (roleId: number): Promise<RoleByIdResponse> => {
        try {
            const response = await apiClient.roles.getRoleById(roleId);

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to fetch role",
                };
            }

            return {
                success: true,
                data: response.data,
                message: "Role fetched successfully"
            };
        } catch (error) {
            console.error('Failed to fetch role by ID:', error);
            return {
                success: false,
                message: "Failed to load role data",
            };
        }
    });

    return authAction(roleId);
}

export async function getUsersByRole(roleId: number, params: PaginationParams = {}): Promise<RoleUsersResponse> {
    const authAction = await withAdminAuth(async (roleId: number, params: PaginationParams = {}): Promise<RoleUsersResponse> => {
        try {
            const queryParams: Record<string, string> = {
                page: (params.page || 0).toString(),
                size: (params.size || 5).toString(),
                sortBy: params.sortBy || "username",
                sortDirection: params.sortDirection || "ASC",
            };

            const response = await apiClient.roles.getUsersByRole(roleId, queryParams);

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to fetch users for role",
                };
            }

            return {
                success: true,
                data: response.data,
                message: "Users for role fetched successfully"
            };
        } catch (error) {
            console.error('Failed to fetch users by role:', error);
            return {
                success: false,
                message: "Failed to load users for role",
            };
        }
    });

    return authAction(roleId, params);
}

export async function createRole(prevState: ActionState<RoleDto> | undefined, formData: CreateRoleFormData): Promise<ActionState<RoleDto>> {
    const authAction = await withAdminAuth(async (prevState: ActionState<RoleDto> | undefined, formData: CreateRoleFormData): Promise<ActionState<RoleDto>> => {
        const result = createRoleSchema.safeParse(formData);

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
                    errors: { root: response.message.split("\n") }
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
                    errors: { root: [error.message] }
                };
            }
            console.error('Unexpected error during role creation:', error);
            return {
                success: false,
                errors: { root: ["An unexpected error occurred"] }
            };
        }
    });

    return authAction(prevState, formData);
}

export async function updateRole(prevState: ActionState<RoleDto> | undefined, formData: UpdateRoleFormData): Promise<ActionState<RoleDto>> {
    const authAction = await withAdminAuth(async (prevState: ActionState<RoleDto> | undefined, formData: UpdateRoleFormData): Promise<ActionState<RoleDto>> => {
        const result = updateRoleSchema.safeParse(formData);

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
                    errors: { root: response.message.split("\n") }
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
                    errors: { root: [error.message] }
                };
            }
            console.error('Unexpected error during role update:', error);
            return {
                success: false,
                errors: { root: ["An unexpected error occurred"] }
            };
        }
    });

    return authAction(prevState, formData);
}

export async function deleteRole(roleId: number): Promise<DeleteRoleResponse> {
    const authAction = await withAdminAuth(async (roleId: number): Promise<DeleteRoleResponse> => {
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
    });

    return authAction(roleId);
}
