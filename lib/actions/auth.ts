"use server";

import { redirect } from "next/navigation";
import z from "zod";

import { apiClient } from "../api-client";
import { loginSchema } from "../schemas";
import type { UserDto, UserPermissions } from "../types";
import { clearSession, getRefreshToken, saveSession } from "../session";
import { HttpError } from "../errors";

export async function login(prevState: unknown, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { errors: z.flattenError(result.error).fieldErrors };
    }

    try {
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

export async function validateAccessToken(): Promise<boolean> {
    try {
        const response = await apiClient.auth.validateToken();
        if (response.success) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to validate access token:', error);
        return false;
    }
}

export async function refreshAuthTokens(): Promise<boolean> {
    try {
        const refreshToken = await getRefreshToken();
        if (refreshToken === null) {
            await clearSession();
            return false;
        }
        const response = await apiClient.auth.refreshToken(refreshToken);
        if (response.success) {
            if (!response.data) {
                await clearSession();
                return false;
            }
            const data = response.data;
            await saveSession({
                accessToken: data.newAccessToken,
                refreshToken: data.newRefreshToken,
                accessTokenExpiry: data.newAccessTokenExpiry,
                refreshTokenExpiry: data.newRefreshTokenExpiry,
            });
            return true;
        }
        await clearSession();
        return false;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        await clearSession();
        return false;
    }
}

export async function getCurrentUser(): Promise<UserDto | null> {
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
}

export async function getCurrentUserPermissions(): Promise<UserPermissions | null> {
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
}