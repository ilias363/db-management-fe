import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UserDto, UserPermissions } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface AuthState {
    // State
    user: UserDto | null;
    permissions: UserPermissions | null;
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    setUser: (user: UserDto | null) => void;
    setPermissions: (permissions: UserPermissions | null) => void;
    setLoading: (loading: boolean) => void;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    initializeAuth: () => Promise<void>;
    clearUser: () => void;
    reset: () => void;
}

const initialState = {
    user: null,
    permissions: null,
    isLoading: false,
    isInitialized: false,
};

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,

                setUser: (user) => set({ user }, false, 'setUser'),

                setPermissions: (permissions) => set({ permissions }, false, 'setPermissions'),

                setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

                refreshAuth: async () => {
                    try {
                        const [userResponse, permissionsResponse] = await Promise.all([
                            apiClient.auth.getCurrentUser(),
                            apiClient.auth.getCurrentUserPermissions(),
                        ]);

                        if (userResponse.success && permissionsResponse.success) {
                            set({
                                user: userResponse.data!,
                                permissions: permissionsResponse.data!,
                            }, false, 'refreshAuth:success');
                        } else {
                            set({
                                user: null,
                                permissions: null,
                            }, false, 'refreshAuth:failed');
                        }
                    } catch (error) {
                        console.error('Auth store : Error refreshing auth:', error);
                        set({
                            user: null,
                            permissions: null,
                        }, false, 'refreshAuth:error');
                    }
                },

                login: async (username: string, password: string): Promise<boolean> => {
                    set({ isLoading: true }, false, 'login:start');

                    try {
                        const response = await apiClient.auth.login({ username, password });

                        if (response.success) {
                            await get().refreshAuth();
                            set({ isLoading: false }, false, 'login:success');
                            return true;
                        } else {
                            toast.error('Login Error', {
                                description: response.message || 'Invalid credentials',
                            });
                            set({ isLoading: false }, false, 'login:failed');
                            return false;
                        }
                    } catch (error) {
                        toast.error('Login Error', {
                            description: error instanceof Error ? error.message : 'An error occurred',
                        });
                        set({ isLoading: false }, false, 'login:error');
                        return false;
                    }
                },

                logout: async () => {
                    set({ isLoading: true }, false, 'logout:start');

                    try {
                        await apiClient.auth.logout();
                    } catch (error) {
                        console.error('Auth store : Logout error:', error);
                    } finally {
                        set({
                            user: null,
                            permissions: null,
                            isLoading: false,
                        }, false, 'logout');
                    }
                },

                initializeAuth: async () => {
                    if (get().isInitialized) return;

                    set({ isLoading: true }, false, 'initializeAuth:start');

                    try {
                        const response = await apiClient.auth.isLoggedIn();

                        if (response.success && response.data?.isLoggedIn) {
                            await get().refreshAuth();
                        } else {
                            set({
                                user: null,
                                permissions: null,
                            }, false, 'initializeAuth:notLoggedIn');
                        }
                    } catch (error) {
                        console.error('Auth store : Authentication check failed:', error);
                        set({
                            user: null,
                            permissions: null,
                        }, false, 'initializeAuth:error');
                    } finally {
                        set({
                            isLoading: false,
                            isInitialized: true,
                        }, false, 'initializeAuth:complete');
                    }
                },

                clearUser: () => set({ user: null, permissions: null }, false, 'clearUser'),

                reset: () => set(initialState, false, 'reset'),
            }),
            {
                name: 'auth-store',
                partialize: (state) => ({
                    user: state.user,
                    permissions: state.permissions,
                    isInitialized: state.isInitialized,
                }),
            }
        ),
        {
            name: 'auth-store',
        }
    )
);

// Selectors for convenience
export const useAuth = () => useAuthStore();
export const useUser = () => useAuthStore((state) => state.user);
export const usePermissions = () => useAuthStore((state) => state.permissions);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
