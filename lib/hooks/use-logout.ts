"use client";

import { useAuth } from "@/lib/stores/auth-store";

export function useLogout() {
    const { logout } = useAuth();

    return async () => {
        try {
            // Clear the auth store immediately
            logout();

            // Call the logout API to clear cookies and invalidate tokens
            await fetch('/api/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
}
