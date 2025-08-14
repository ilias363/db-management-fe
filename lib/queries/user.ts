import { queryOptions } from "@tanstack/react-query";
import { getUsersData, getUserById, getUserAuditLogs, type UsersDataParams } from "@/lib/actions/user";
import { getAllRoles } from "@/lib/actions/role";
import type { PaginationParams } from "@/lib/types";

export const userQueries = {
    all: () => ["users"] as const,

    lists: () => [...userQueries.all(), "list"] as const,
    list: (params: UsersDataParams = {}) =>
        queryOptions({
            queryKey: [...userQueries.lists(), params],
            queryFn: () => getUsersData(params),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    details: () => [...userQueries.all(), "detail"] as const,
    detail: (userId: number) =>
        queryOptions({
            queryKey: [...userQueries.details(), userId],
            queryFn: () => getUserById(userId),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    audits: () => [...userQueries.all(), "audits"] as const,
    userAudits: (userId: number, params: PaginationParams = {}) =>
        queryOptions({
            queryKey: [...userQueries.audits(), userId, params],
            queryFn: () => getUserAuditLogs(userId, params),
            staleTime: 2 * 60 * 1000,
            retry: 2,
        }),

    // Helper query for roles (needed in user forms)
    roles: () => ["roles", "list"] as const,
    allRoles: () =>
        queryOptions({
            queryKey: userQueries.roles(),
            queryFn: getAllRoles,
            staleTime: 10 * 60 * 1000,
            retry: 2,
        }),
};
