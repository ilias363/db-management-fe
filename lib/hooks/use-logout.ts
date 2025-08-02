"use client";

import { useAuth } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";

export function useLogout() {
    const { logout } = useAuth();
    const router = useRouter();

    return async () => {
        try {
            // Call the logout API to clear cookies and invalidate tokens
            await fetch('/api/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }

        // Clear local state
        logout();
        router.push('/login');
    };
}
