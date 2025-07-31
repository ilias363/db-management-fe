// User management related interfaces

import { ApiResponse, PageDto, RoleDto } from './index';

export interface UserDto {
    id: number;
    username: string;
    active: boolean;
    roles: RoleDto[];
}

export interface NewUserDto {
    username: string;
    active: boolean;
    password: string;
    roles: number[];
}

export interface UpdateUserDto {
    id: number;
    username: string;
    active: boolean;
    roles: number[];
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    newThisMonth: number;
    activeUserPercentage: number;
}

export type UserPageDto = PageDto<UserDto>;

export type UserResponse = ApiResponse<UserDto>;
export type UserPageResponse = ApiResponse<UserPageDto>;
export type UserStatsResponse = ApiResponse<UserStats>;
