import { useQuery } from "@tanstack/react-query";
import { analyticsQueries } from "../queries";
import { useState } from "react";
import type { AnalyticsTimeRange } from "../types";

export function useDatabaseStats(includeSystem: boolean = true, options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.databaseStats(includeSystem),
        enabled: options?.enabled,
    });
}

export function useDatabaseUsage(includeSystem: boolean = true, options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.databaseUsage(includeSystem),
        enabled: options?.enabled,
    });
}

export function useDatabaseType(options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.databaseType(),
        enabled: options?.enabled,
    });
}

export function useDashboardStats(includeSystem: boolean = true, options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.dashboardStats(includeSystem),
        enabled: options?.enabled,
    });
}

export function useUserActivity(params?: AnalyticsTimeRange, options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.userActivity(params),
        enabled: options?.enabled,
    });
}

export function useTopUsersByActivity(
    params?: AnalyticsTimeRange & { limit?: number },
    options?: { enabled?: boolean }
) {
    return useQuery({
        ...analyticsQueries.userTopActivity(params),
        enabled: options?.enabled,
    });
}

export function useRoleDistribution(options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.roleDistribution(),
        enabled: options?.enabled,
    });
}

export function useAuditActivity(params?: AnalyticsTimeRange, options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.auditActivity(params),
        enabled: options?.enabled,
    });
}

export function useAuditHeatmap(params?: AnalyticsTimeRange, options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.auditHeatmap(params),
        enabled: options?.enabled,
    });
}

export function useAnalyticsTimeRange(initialRange: AnalyticsTimeRange = { period: 'week' }) {
    const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>(initialRange);
    return {
        timeRange,
        setTimeRange,
    };
}

export function useUserDashboardStats(options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.userDashboardStats(),
        enabled: options?.enabled,
    });
}

export function useUserActionBreakdown(options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.userActionBreakdown(),
        enabled: options?.enabled,
    });
}

export function useUserRecentActivity(limit?: number, options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.userRecentActivity(limit),
        enabled: options?.enabled,
    });
}

export function useUserDatabaseAccess(options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.userDatabaseAccess(),
        enabled: options?.enabled,
    });
}

export function useUserAuditHeatmap(options?: { enabled?: boolean }) {
    return useQuery({
        ...analyticsQueries.userAuditHeatmap(),
        enabled: options?.enabled,
    });
}
