"use server";

import { redirect } from "next/navigation";
import z from "zod";

import { apiClient } from "../api-client";
import { loginSchema } from "../schemas";
import type { UserDto, UserPermissions } from "../types";
import { clearSession, saveSession } from "../session";
import { HttpError } from "../errors";
import { withAuth } from "./auth-utils";

export async function login(prevState: unknown, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { errors: z.flattenError(result.error).fieldErrors };
    }

    try {
        await clearSession();
        const response = await apiClient.auth.login(result.data);
        if (!response.success) {
            return { errors: { username: [response.message] } };
        }
        if (!response.data) {
            return { errors: { username: ["No user data returned from login."] } };
        }
        await saveSession(response.data);
    } catch (error) {
        if (error instanceof HttpError) {
            return { errors: { username: [error.message] } };
        }
        console.error('Unexpected error during login:', error);
        return { errors: { username: ["An unexpected error occurred. Please try again."] } };
    }

    redirect("/");
}

export async function logout() {
    try {
        await apiClient.auth.logout();
    } catch (error) {
        console.error('Logout API call failed:', error);
    }
    await clearSession();
}

export async function getCurrentUser(): Promise<UserDto | null> {
    const authAction = await withAuth(async (): Promise<UserDto | null> => {
        try {
            const response = await apiClient.auth.getCurrentUser();
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    });

    return authAction();
}

export async function getCurrentUserPermissions(): Promise<UserPermissions | null> {
    const authAction = await withAuth(async (): Promise<UserPermissions | null> => {
        try {
            const response = await apiClient.auth.getCurrentUserPermissions();
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error('Failed to get user permissions:', error);
            return null;
        }
    });

    return authAction();
}

export async function getIsSystemAdmin(): Promise<boolean | null> {
    const authAction = await withAuth(async (): Promise<boolean | null> => {
        try {
            const response = await apiClient.auth.getIsCurrentUserSystemAdmin();
            return response.success && response.data?.isSystemAdmin === true;
        } catch (error) {
            console.error('Failed to check if current user is system admin:', error);
            return null;
        }
    });

    return authAction();
}