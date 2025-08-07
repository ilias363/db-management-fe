"use server";

import { getAuthTokens, saveSession, clearSession } from "../session";
import { apiClient } from "../api-client";
import { redirect } from "next/navigation";

export async function ensureAuthenticated(): Promise<boolean> {
    try {
        const { accessToken, refreshToken } = await getAuthTokens();

        // If no tokens at all, user is not authenticated
        if (!accessToken && !refreshToken) {
            return false;
        }

        // If we have an access token, try to validate it
        if (accessToken) {
            try {
                const response = await apiClient.auth.validateToken();
                if (response.success) {
                    return true;
                }
            } catch {
                if (!refreshToken) {
                    await clearSession();
                    return false;
                }
            }
        }

        // Try to refresh the token if we have a refresh token
        if (refreshToken) {
            try {
                const response = await apiClient.auth.refreshToken(refreshToken);
                if (response.success && response.data) {
                    await saveSession({
                        accessToken: response.data.newAccessToken,
                        refreshToken: response.data.newRefreshToken,
                        accessTokenExpiry: response.data.newAccessTokenExpiry,
                        refreshTokenExpiry: response.data.newRefreshTokenExpiry,
                    });
                    return true;
                }
            } catch (error) {
                console.error('Failed to refresh token:', error);
            }
        }

        await clearSession();
        return false;
    } catch (error) {
        console.error('Authentication check failed:', error);
        await clearSession();
        return false;
    }
}

export async function withAuth<T extends unknown[], R>(
    action: (...args: T) => Promise<R>
): Promise<(...args: T) => Promise<R>> {
    return async (...args: T) => {
        const isAuthenticated = await ensureAuthenticated();
        if (!isAuthenticated) {
            redirect("/login?expiredsession=true");
        }
        return action(...args);
    };
}

export async function getIsSystemAdmin(): Promise<boolean> {
    try {
        const response = await apiClient.auth.getIsCurrentUserSystemAdmin();
        return response.success && response.data?.isSystemAdmin === true;
    } catch (error) {
        console.error('Failed to check if current user is system admin:', error);
        return false;
    }
};
