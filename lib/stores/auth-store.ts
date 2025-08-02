import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '@/lib/types';

interface AuthState {
    user: UserDto | null;
    isLoading: boolean;
    isInitialized: boolean;
    hasAttemptedAuth: boolean;

    setUser: (user: UserDto) => void;
    setLoading: (loading: boolean) => void;
    login: (user: UserDto) => void;
    logout: () => void;
    refreshAuth: () => Promise<void>;
    initializeAuth: () => Promise<void>;
}

const initialState = {
    user: null,
    isLoading: false,
    isInitialized: false,
    hasAttemptedAuth: false,
};

export const useAuth = create<AuthState>()(
    persist(
        (set, get) => ({
            ...initialState,

            login: (user) => set({
                user,
                isLoading: false,
                isInitialized: true
            }, false),

            logout: () => set({
                ...initialState,
                isInitialized: true
            }),

            setUser: (user) => set({ user }, false),

            setLoading: (isLoading) => set({ isLoading }, false),

            refreshAuth: async () => {
                set({ isLoading: true, hasAttemptedAuth: true });

                try {
                    const userResponse = await fetch('/api/auth/current-user');

                    if (userResponse.ok) {
                        const userData = await userResponse.json();

                        if (userData.success) {
                            set({
                                user: userData.data,
                                isLoading: false,
                                isInitialized: true
                            });
                            return;
                        }
                    }

                    set({
                        ...initialState,
                        isInitialized: true
                    });
                } catch {
                    set({
                        ...initialState,
                        isInitialized: true
                    });
                }
            },

            initializeAuth: async () => {
                const { isInitialized } = get();
                if (isInitialized) return;

                get().refreshAuth();
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isInitialized: state.isInitialized,
            }),
        }
    )
);
