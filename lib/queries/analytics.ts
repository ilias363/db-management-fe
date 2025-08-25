import { queryOptions } from "@tanstack/react-query";
import {
    getDatabaseStats,
    getDatabaseUsage,
    getDatabaseType,
    getDashboardStats,
    getUserActivity,
    getTopUsersByActivity,
    getRoleDistribution,
    getAuditActivity,
    getAuditHeatmap,
    getUserDashboardStats,
    getUserActionBreakdown,
    getUserRecentActivity,
    getUserDatabaseAccess,
    getUserAuditHeatmap,
} from "../actions";
import type { AnalyticsTimeRange } from "../types";

export const analyticsQueries = {
    all: () => ["analytics"] as const,
    allForAdmin: () => [...analyticsQueries.all(), "admin"] as const,
    allForUser: () => [...analyticsQueries.all(), "user"] as const,

    database: () => [...analyticsQueries.allForAdmin(), "database"] as const,
    databaseStats: (includeSystem: boolean) =>
        queryOptions({
            queryKey: [...analyticsQueries.database(), "stats", { includeSystem }],
            queryFn: () => getDatabaseStats(includeSystem),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    databaseUsage: (includeSystem: boolean) =>
        queryOptions({
            queryKey: [...analyticsQueries.database(), "usage", { includeSystem }],
            queryFn: () => getDatabaseUsage(includeSystem),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    databaseType: () =>
        queryOptions({
            queryKey: [...analyticsQueries.database(), "type"],
            queryFn: getDatabaseType,
            staleTime: Infinity,
            retry: 2,
        }),

    dashboard: () => [...analyticsQueries.allForAdmin(), "dashboard"] as const,
    dashboardStats: (includeSystem: boolean) =>
        queryOptions({
            queryKey: [...analyticsQueries.dashboard(), "stats", { includeSystem }],
            queryFn: () => getDashboardStats(includeSystem),
            staleTime: 2 * 60 * 1000,
            retry: 2,
        }),

    user: () => [...analyticsQueries.allForAdmin(), "user"] as const,
    userActivity: (params?: AnalyticsTimeRange) =>
        queryOptions({
            queryKey: [...analyticsQueries.user(), "activity", params],
            queryFn: () => getUserActivity(params),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    userTopActivity: (params?: AnalyticsTimeRange & { limit?: number }) =>
        queryOptions({
            queryKey: [...analyticsQueries.user(), "topActivity", params],
            queryFn: () => getTopUsersByActivity(params),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    role: () => [...analyticsQueries.allForAdmin(), "role"] as const,
    roleDistribution: () =>
        queryOptions({
            queryKey: [...analyticsQueries.role(), "distribution"],
            queryFn: getRoleDistribution,
            staleTime: 10 * 60 * 1000,
            retry: 2,
        }),

    audit: () => [...analyticsQueries.allForAdmin(), "audit"] as const,
    auditActivity: (params?: AnalyticsTimeRange) =>
        queryOptions({
            queryKey: [...analyticsQueries.audit(), "activity", params],
            queryFn: () => getAuditActivity(params),
            staleTime: 2 * 60 * 1000,
            retry: 2,
        }),

    auditHeatmap: (params?: AnalyticsTimeRange) =>
        queryOptions({
            queryKey: [...analyticsQueries.audit(), "heatmap", params],
            queryFn: () => getAuditHeatmap(params),
            staleTime: 10 * 60 * 1000,
            retry: 2,
        }),

    userDashboardStats: () =>
        queryOptions({
            queryKey: [...analyticsQueries.allForUser(), "dashboard", "stats"],
            queryFn: () => getUserDashboardStats(),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    userActionBreakdown: () =>
        queryOptions({
            queryKey: [...analyticsQueries.allForUser(), "audit", "actionBreakdown"],
            queryFn: () => getUserActionBreakdown(),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    userRecentActivity: (limit?: number) =>
        queryOptions({
            queryKey: [...analyticsQueries.allForUser(), "audit", "recentActivity", { limit }],
            queryFn: () => getUserRecentActivity(limit),
            staleTime: 2 * 60 * 1000,
            retry: 2,
        }),

    userDatabaseAccess: () =>
        queryOptions({
            queryKey: [...analyticsQueries.allForUser(), "database", "databaseAccess"],
            queryFn: () => getUserDatabaseAccess(),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),

    userAuditHeatmap: () =>
        queryOptions({
            queryKey: [...analyticsQueries.allForUser(), "audit", "auditHeatmap"],
            queryFn: () => getUserAuditHeatmap(),
            staleTime: 10 * 60 * 1000,
            retry: 2,
        }),
};