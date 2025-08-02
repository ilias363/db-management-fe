// Authentication

import { ApiResponse, UserDto } from "./index";

export interface LoginRequestDto {
    username: string;
    password: string;
}

export interface LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: number;
    refreshTokenExpiry: number;
}

export interface TokenRefreshRequestDto {
    refreshToken: string;
}

export interface TokenRefreshResponseDto {
    newAccessToken: string;
    newRefreshToken: string;
    newAccessTokenExpiry: number;
    newRefreshTokenExpiry: number;
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

export type LoginResponse = ApiResponse<LoginResponseDto>;
export type LogoutResponse = ApiResponse<void>;
export type RefreshTokenResponse = ApiResponse<TokenRefreshResponseDto>;
export type ValidateTokenResponse = ApiResponse<{ isValid: boolean }>;
export type CurrentUserResponse = ApiResponse<UserDto>;
export type UserPermissionsResponse = ApiResponse<UserPermissions>;
export type DetailedPermissionsResponse = ApiResponse<DetailedPermissions>;
