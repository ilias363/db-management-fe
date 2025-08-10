import { queryOptions } from "@tanstack/react-query";
import { getCurrentUser, getCurrentUserPermissions, getDetailedPermissions, getIsSystemAdmin } from "@/lib/actions/auth";

export const authQueries = {
    all: () => ["auth"] as const,

    currentUser: () => [...authQueries.all(), "currentUser"] as const,
    currentUserQuery: () =>
        queryOptions({
            queryKey: authQueries.currentUser(),
            queryFn: getCurrentUser,
            staleTime: Infinity,
            retry: 2,
        }),

    permissions: () => [...authQueries.all(), "permissions"] as const,
    permissionsQuery: () =>
        queryOptions({
            queryKey: authQueries.permissions(),
            queryFn: getCurrentUserPermissions,
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    detailedPermissions: () => [...authQueries.all(), "detailedPermissions"] as const,
    detailedPermissionsQuery: (schemaName?: string, tableName?: string) =>
        queryOptions({
            queryKey: [...authQueries.detailedPermissions(), schemaName, tableName],
            queryFn: () => getDetailedPermissions(schemaName, tableName),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    isSystemAdmin: () => [...authQueries.all(), "isSystemAdmin"] as const,
    isSystemAdminQuery: () =>
        queryOptions({
            queryKey: authQueries.isSystemAdmin(),
            queryFn: getIsSystemAdmin,
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),
};
