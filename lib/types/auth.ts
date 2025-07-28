// Authentication

import { ApiResponse, UserDto } from "./index";

export interface LoginRequestDto {
    username: string;
    password: string;
}

export interface UserPermissions {
    isAdmin: boolean;
    isViewer: boolean;
    hasUserManagementAccess: boolean;
    hasDbAccess: boolean;
    hasDbReadAccess: boolean;
    hasDbWriteAccess: boolean;
}

export interface DetailedPermissions {
    currentUser: UserDto;
    rolePermissions: {
        isSystemAdmin: boolean;
        isDatabaseAdmin: boolean;
        isDatabaseViewer: boolean;
        hasUserManagementAccess: boolean;
    };
    databasePermissions: {
        hasDbAccess: boolean;
        hasDbReadAccess: boolean;
        hasDbWriteAccess: boolean;
    };
    granularPermissions?: {
        canRead: boolean;
        canWrite: boolean;
        canCreate: boolean;
        canDelete: boolean;
    };
    targetSchema?: string;
    targetTable?: string;
}

export type LoginResponse = ApiResponse<void>;
export type LogoutResponse = ApiResponse<void>;
export type IsLoggedInResponse = ApiResponse<{ isLoggedIn: boolean }>;
export type CurrentUserResponse = ApiResponse<UserDto>;
export type UserPermissionsResponse = ApiResponse<UserPermissions>;
export type DetailedPermissionsResponse = ApiResponse<DetailedPermissions>;
