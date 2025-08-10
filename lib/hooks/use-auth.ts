import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authQueries } from "@/lib/queries";

export function useCurrentUser() {
    const queryClient = useQueryClient();

    const query = useQuery(authQueries.currentUserQuery());

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: authQueries.currentUser()
        }),
    };
}

export function useDbPermissions() {
    const queryClient = useQueryClient();

    const query = useQuery(authQueries.permissionsQuery());

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: authQueries.permissions()
        }),
    };
}

export function useDetailedPermissions(schemaName?: string, tableName?: string) {
    const queryClient = useQueryClient();

    const query = useQuery(authQueries.detailedPermissionsQuery(schemaName, tableName));

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: authQueries.detailedPermissions(),
        }),
    };
}

export function useIsSystemAdmin() {
    const queryClient = useQueryClient();

    const query = useQuery(authQueries.isSystemAdminQuery());

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: authQueries.isSystemAdmin()
        }),
    };
}
