import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authQueries } from "@/lib/queries";

export function useCurrentUser(options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...authQueries.currentUserQuery(),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: authQueries.currentUser()
        }),
    };
}

export function useDbPermissions(options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...authQueries.permissionsQuery(),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: authQueries.permissions()
        }),
    };
}

export function useDetailedPermissions(schemaName?: string, tableName?: string, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...authQueries.detailedPermissionsQuery(schemaName, tableName),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: authQueries.detailedPermissions(),
        }),
    };
}

export function useIsSystemAdmin(options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...authQueries.isSystemAdminQuery(),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: authQueries.isSystemAdmin()
        }),
    };
}
