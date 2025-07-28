// Role management related interfaces

import { ApiResponse, PermissionDetailDto } from "./index";

export interface RoleDto {
    id: number;
    name: string;
    description: string;
    permissions: PermissionDetailDto[];
}

export interface NewRoleDto {
    name: string;
    description?: string;
    permissions: PermissionDetailDto[];
}

export interface UpdateRoleDto {
    id: number;
    name: string;
    description?: string;
    permissions: PermissionDetailDto[];
}

export type RoleResponse = ApiResponse<RoleDto>;
export type RolesResponse = ApiResponse<RoleDto[]>;
