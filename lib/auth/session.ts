"use server";

import { cookies } from "next/headers";

export interface SessionData {
    userId: number;
    username: string;
    isSystemAdmin: boolean;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: number;
    refreshTokenExpiry: number;
}

export async function createSession(sessionData: SessionData) {
    try {
        const cookieStore = await cookies();

        cookieStore.set("session", JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: new Date(sessionData.refreshTokenExpiry),
            path: "/",
        });
    } catch (error) {
        console.error("Failed to create session:", error);
        throw error;
    }
}

export async function getSession(): Promise<SessionData | null> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session")?.value;

        if (!sessionCookie) return null;

        try {
            const sessionData: SessionData = JSON.parse(sessionCookie);
            return sessionData;
        } catch (error) {
            console.error("Failed to parse session:", error);
            return null;
        }
    } catch (error) {
        console.error("Failed to get session:", error);
        return null;
    }
}

export async function deleteSession() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("session");
    } catch (error) {
        console.error("Failed to delete session:", error);
        throw error;
    }
}

export async function updateSession(updates: Partial<SessionData>) {
    try {
        const session = await getSession();
        if (!session) return null;

        const updatedSession = { ...session, ...updates };
        await createSession(updatedSession);
        return updatedSession;
    } catch (error) {
        console.error("Failed to update session:", error);
        throw error;
    }
}
