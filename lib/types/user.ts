// User management related interfaces

import { ApiResponse , RoleDto } from './index';

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

export type UserResponse = ApiResponse<UserDto>;
export type UsersResponse = ApiResponse<UserDto[]>;
