"use server";

import { apiClient } from "../api-client";
import { withAuth } from "../auth";
import {
    AnalyticsTimeRange,
    AuditActivityData,
    DatabaseStats,
    DatabaseTypeDto,
    DatabaseUsageData,
    RoleDistributionData,
    TopUsersByActivity,
    UserActivityData,
} from "../types";

export async function getDatabaseUsage(
    includeSystem: boolean
): Promise<DatabaseUsageData[] | null> {
    const authAction = await withAuth(async (): Promise<DatabaseUsageData[] | null> => {
        try {
            const response = await apiClient.analytics.getDatabaseUsage(includeSystem);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get database usage:", error);
            return null;
        }
    });
    return authAction();
}

export async function getDatabaseType(): Promise<DatabaseTypeDto | null> {
    const authAction = await withAuth(async (): Promise<DatabaseTypeDto | null> => {
        try {
            const response = await apiClient.analytics.getDatabaseType();
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get database type:", error);
            return null;
        }
    });
    return authAction();
}

export async function getDatabaseStats(includeSystem: boolean): Promise<DatabaseStats | null> {
    const authAction = await withAuth(async (): Promise<DatabaseStats | null> => {
        try {
            const response = await apiClient.analytics.getDatabaseStats(includeSystem);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get database stats:", error);
            return null;
        }
    });

    return authAction();
}

export async function getDashboardStats(includeSystem: boolean): Promise<DatabaseStats | null> {
    const authAction = await withAuth(async (): Promise<DatabaseStats | null> => {
        try {
            const response = await apiClient.analytics.getDashboardStats(includeSystem);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get dashboard stats:", error);
            return null;
        }
    });
    return authAction();
}

export async function getUserActivity(
    params?: AnalyticsTimeRange
): Promise<UserActivityData[] | null> {
    const authAction = await withAuth(async (): Promise<UserActivityData[] | null> => {
        try {
            const response = await apiClient.analytics.getUserActivity(params);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get user activity:", error);
            return null;
        }
    });
    return authAction();
}

export async function getTopUsersByActivity(
    params?: AnalyticsTimeRange & { limit?: number }
): Promise<TopUsersByActivity[] | null> {
    const authAction = await withAuth(async (): Promise<TopUsersByActivity[] | null> => {
        try {
            const response = await apiClient.analytics.getTopUsersByActivity(params);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get top users by activity:", error);
            return null;
        }
    });
    return authAction();
}

export async function getRoleDistribution(): Promise<RoleDistributionData[] | null> {
    const authAction = await withAuth(async (): Promise<RoleDistributionData[] | null> => {
        try {
            const response = await apiClient.analytics.getRoleDistribution();
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get role distribution:", error);
            return null;
        }
    });
    return authAction();
}

export async function getAuditActivity(
    params?: AnalyticsTimeRange
): Promise<AuditActivityData[] | null> {
    const authAction = await withAuth(async (): Promise<AuditActivityData[] | null> => {
        try {
            const response = await apiClient.analytics.getAuditActivity(params);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get audit activity:", error);
            return null;
        }
    });
    return authAction();
}
