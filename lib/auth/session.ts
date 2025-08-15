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
    const cookieStore = await cookies();

    cookieStore.set("session", JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(sessionData.refreshTokenExpiry),
        path: "/",
    });
}

export async function getSession(): Promise<SessionData | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) return null;

    try {
        const sessionData: SessionData = JSON.parse(sessionCookie);

        // Check if the refresh token has expired, or will expire after 1 second
        if (Date.now() + 1000 >= sessionData.refreshTokenExpiry) {
            await deleteSession();
            return null;
        }

        return sessionData;
    } catch (error) {
        console.error("Failed to parse session:", error);
        await deleteSession();
        return null;
    }
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

export async function updateSession(updates: Partial<SessionData>) {
    const session = await getSession();
    if (!session) return null;

    const updatedSession = { ...session, ...updates };
    await createSession(updatedSession);
    return updatedSession;
}
