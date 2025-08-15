"use client";

import { useAuth } from "@/lib/auth/auth-context";

export function useLogout() {
    const { logout } = useAuth();
    return logout;
}

export function useCurrentUser() {
    const { user, isLoading } = useAuth();
    return {
        data: user,
        isLoading,
        error: null,
    };
}
