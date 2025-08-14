import { queryOptions } from "@tanstack/react-query";
import { getRolesData, getRoleById, getUsersByRole, type RolesDataParams } from "@/lib/actions/role";
import type { PaginationParams } from "@/lib/types";

export const roleQueries = {
    all: () => ["roles"] as const,

    lists: () => [...roleQueries.all(), "list"] as const,
    list: (params: RolesDataParams = {}) =>
        queryOptions({
            queryKey: [...roleQueries.lists(), params],
            queryFn: () => getRolesData(params),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    details: () => [...roleQueries.all(), "detail"] as const,
    detail: (roleId: number) =>
        queryOptions({
            queryKey: [...roleQueries.details(), roleId],
            queryFn: () => getRoleById(roleId),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    users: () => [...roleQueries.all(), "users"] as const,
    roleUsers: (roleId: number, params: PaginationParams = {}) =>
        queryOptions({
            queryKey: [...roleQueries.users(), roleId, params],
            queryFn: () => getUsersByRole(roleId, params),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),
};
