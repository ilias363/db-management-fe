"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/schemas";
import { createSession, deleteSession, getSession, updateSession } from "./session";
import type { UserDto, UserPermissions, DetailedPermissions } from "@/lib/types";
import { apiClient } from "../api-client";

export async function loginAction(prevState: unknown, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors
        };
    }

    try {
        const response = await apiClient.auth.login(result.data);

        if (!response.success || !response.data) {
            return {
                success: false,
                errors: { username: [response.message || "Login failed"] }
            };
        }

        // Get user details
        const userResponse = await apiClient.auth.getCurrentUser(response.data.accessToken);
        const adminResponse = await apiClient.auth.getIsCurrentUserSystemAdmin(response.data.accessToken);

        if (!userResponse.success || !userResponse.data) {
            return {
                success: false,
                errors: { username: ["Failed to get user information"] }
            };
        }

        // Create session
        await createSession({
            userId: userResponse.data.id,
            username: userResponse.data.username,
            isSystemAdmin: adminResponse.success && adminResponse.data?.isSystemAdmin || false,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            accessTokenExpiry: response.data.accessTokenExpiry,
            refreshTokenExpiry: response.data.refreshTokenExpiry,
        });

        return { success: true };
    } catch (error) {
        console.error("Login error:", error);
        return {
            success: false,
            errors: { username: [error instanceof Error ? error.message : "An unexpected error occurred"] }
        };
    }
}

export async function logoutAction() {
    const session = await getSession();

    if (session?.accessToken) {
        try {
            await apiClient.auth.logout(session.accessToken);
        } catch (error) {
            console.error("Logout API call failed:", error);
        }
    }

    await deleteSession();
    redirect("/login");
}

export async function getCurrentUser(): Promise<UserDto | null> {
    const session = await getSession();
    if (!session) return null;

    try {
        const validatedSession = await validateAndRefreshSession();
        if (!validatedSession) return null;

        const response = await apiClient.auth.getCurrentUser(validatedSession.accessToken);
        return response.success && response.data ? response.data : null;
    } catch (error) {
        console.error("Failed to get current user:", error);
        return null;
    }
}

export async function getCurrentUserPermissions(): Promise<UserPermissions | null> {
    const session = await validateAndRefreshSession();
    if (!session) return null;

    try {
        const response = await apiClient.auth.getCurrentUserPermissions(session.accessToken);
        return response.success && response.data ? response.data : null;
    } catch (error) {
        console.error("Failed to get user permissions:", error);
        return null;
    }
}

export async function getDetailedPermissions(
    schemaName?: string,
    tableName?: string
): Promise<DetailedPermissions | null> {
    const session = await validateAndRefreshSession();
    if (!session) return null;

    try {
        const response = await apiClient.auth.getDetailedPermissions(
            session.accessToken,
            schemaName,
            tableName
        );
        return response.success && response.data ? response.data : null;
    } catch (error) {
        console.error("Failed to get detailed permissions:", error);
        return null;
    }
}

export async function getIsSystemAdmin(): Promise<boolean> {
    const session = await validateAndRefreshSession();
    if (!session) return false;

    try {
        const response = await apiClient.auth.getIsCurrentUserSystemAdmin(session.accessToken);
        return response.success && response.data?.isSystemAdmin || false;
    } catch (error) {
        console.error("Failed to check admin status:", error);
        return false;
    }
}

async function validateAndRefreshSession() {
    const session = await getSession();
    if (!session) return null;

    // Check if access token is expired
    const now = Date.now() + 1000; // Add 1 second buffer
    if (now < session.accessTokenExpiry) {
        return session;
    }

    // Check if refresh token is expired
    if (now >= session.refreshTokenExpiry) {
        await deleteSession();
        return null;
    }

    // Try to refresh the token
    try {
        const response = await apiClient.auth.refreshToken(session.refreshToken);

        if (!response.success || !response.data) {
            await deleteSession();
            return null;
        }

        const updatedSession = await updateSession({
            accessToken: response.data.newAccessToken,
            refreshToken: response.data.newRefreshToken,
            accessTokenExpiry: response.data.newAccessTokenExpiry,
            refreshTokenExpiry: response.data.newRefreshTokenExpiry,
        });

        return updatedSession;
    } catch (error) {
        console.error("Failed to refresh token:", error);
        await deleteSession();
        return null;
    }
}

export async function requireAuth() {
    const session = await validateAndRefreshSession();
    if (!session) {
        redirect("/login?expired=true");
    }
    return session;
}

export async function requireAdmin() {
    const session = await requireAuth();

    if (!session.isSystemAdmin) {
        const isAdmin = await getIsSystemAdmin();
        if (!isAdmin) {
            redirect("/?unauthorized=true");
        }
    }

    return session;
}
