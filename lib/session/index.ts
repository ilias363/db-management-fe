import "server-only";
import { cookies } from "next/headers";

interface SessionData {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: number;
    refreshTokenExpiry: number;
}

export async function saveSession(data: SessionData): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set({
        name: "access_token",
        value: data.accessToken,
        expires: new Date(data.accessTokenExpiry),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
    })

    cookieStore.set({
        name: "refresh_token",
        value: data.refreshToken,
        expires: new Date(data.refreshTokenExpiry),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "strict",
    })
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
}

export async function getAuthTokens(): Promise<{ accessToken: string | null, refreshToken: string | null }> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value || null;
    const refreshToken = cookieStore.get("refresh_token")?.value || null;
    return { accessToken, refreshToken };
}

export async function getAccesToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value || null;
}

export async function getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get("refresh_token")?.value || null;
}