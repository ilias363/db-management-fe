"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { loginSchema } from "@/lib/schemas";
import { createSession, deleteSession, getSession, updateSession, type SessionData } from "./session";
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
            schemaName,
            tableName,
            session.accessToken
        );
        return response.success && response.data ? response.data : null;
    } catch (error) {
        console.error("Failed to get detailed permissions:", error);
        return null;
    }
}

export async function getIsSystemAdmin(validateSession: boolean = true): Promise<boolean> {
    let session: SessionData | null = null;
  
	if (validateSession) {
		session = await validateAndRefreshSession();
		if (!session) return false;
	}

    try {
        const response = await apiClient.auth.getIsCurrentUserSystemAdmin(session?.accessToken);
        return response.success && response.data?.isSystemAdmin || false;
    } catch (error) {
        console.error("Failed to check admin status:", error);
        return false;
    }
}

interface SessionValidationResult {
    session: SessionData | null;
    needsRefresh: boolean;
    needsRedirect: boolean;
}

async function checkSessionStatus(): Promise<SessionValidationResult> {
    const session = await getSession();
    if (!session) {
        return { session: null, needsRefresh: false, needsRedirect: true };
    }

    try {
        const response = await apiClient.auth.validateToken(session.accessToken);
        if (response.success && response.data?.isValid) {
            return { session, needsRefresh: false, needsRedirect: false };
        }
    } catch { }

    // Access token is invalid but refresh token is still valid
    return { session, needsRefresh: true, needsRedirect: false };
}

async function validateAndRefreshSession() {
    const status = await checkSessionStatus();

    if (status.needsRedirect) {
        try {
            await deleteSession();
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
        return null;
    }

    if (!status.needsRefresh) {
        return status.session;
    }

    // Try to refresh the token
    try {
        const response = await apiClient.auth.refreshToken(status.session!.refreshToken);

        if (!response.success || !response.data) {
            try {
                await deleteSession();
            } catch (error) {
                console.error("Failed to delete session:", error);
            }
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
        try {
            await deleteSession();
        } catch (deleteError) {
            console.error("Failed to delete session:", deleteError);
        }
        return null;
    }
}

async function getCurrentCallbackUrl(): Promise<string> {
    try {
        const headersList = await headers();
        const referer = headersList.get('referer');

        if (referer) {
            const refererUrl = new URL(referer);
            return refererUrl.pathname !== '/' ? refererUrl.pathname : '';
        }
    } catch { }
    return '';
}

export async function requireAuth() {
    const session = await validateAndRefreshSession();
    if (!session) {
        const callbackUrl = await getCurrentCallbackUrl();
        const loginUrl = callbackUrl ? `/login?expired=true&callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login?expired=true";
        redirect(loginUrl);
    }
    return session;
}

export async function requireAdmin() {
    const session = await requireAuth();

    if (!session.isSystemAdmin) {
        const isAdmin = await getIsSystemAdmin(false);
        if (!isAdmin) {
            redirect("/?unauthorized=true");
        }
    }

    return session;
}
