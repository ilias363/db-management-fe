import { useQuery } from "@tanstack/react-query";
import { userQueries, roleQueries, auditQueries } from "@/lib/queries";
import type { UsersDataParams, RolesDataParams, AuditDataParams } from "@/lib/actions";
import type { PaginationParams } from "@/lib/types";

// User hooks
export function useUsersData(params: UsersDataParams = {}, options?: { enabled?: boolean }) {
    return useQuery({
        ...userQueries.list(params),
        enabled: options?.enabled,
    });
}

export function useUserDetail(userId: number, options?: { enabled?: boolean }) {
    return useQuery({
        ...userQueries.detail(userId),
        enabled: options?.enabled,
    });
}

export function useUserAudits(userId: number, params: PaginationParams = {}, options?: { enabled?: boolean }) {
    return useQuery({
        ...userQueries.userAudits(userId, params),
        enabled: options?.enabled,
    });
}

export function useAllRoles(options?: { enabled?: boolean }) {
    return useQuery({
        ...userQueries.allRoles(),
        enabled: options?.enabled,
    });
}

// Role hooks
export function useRolesData(params: RolesDataParams = {}, options?: { enabled?: boolean }) {
    return useQuery({
        ...roleQueries.list(params),
        enabled: options?.enabled,
    });
}

export function useRoleDetail(roleId: number, options?: { enabled?: boolean }) {
    return useQuery({
        ...roleQueries.detail(roleId),
        enabled: options?.enabled,
    });
}

export function useRoleUsers(roleId: number, params: PaginationParams = {}, options?: { enabled?: boolean }) {
    return useQuery({
        ...roleQueries.roleUsers(roleId, params),
        enabled: options?.enabled,
    });
}

// Audit hooks
export function useAuditData(params: AuditDataParams = {}, options?: { enabled?: boolean }) {
    return useQuery({
        ...auditQueries.list(params),
        enabled: options?.enabled,
    });
}
