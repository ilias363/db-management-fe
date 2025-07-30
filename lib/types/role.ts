// Role management related interfaces

import { ApiResponse, PageDto, PermissionDetailDto } from "./index";

export interface RoleDto {
    id: number;
    name: string;
    description: string;
    isSystemRole: boolean;
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

export type RolePageDto = PageDto<RoleDto>;

export type RoleResponse = ApiResponse<RoleDto>;
export type RolePageResponse = ApiResponse<RolePageDto>;
