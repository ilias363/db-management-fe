// Analytics types

import { ApiResponse } from "./common";

export interface DatabaseTypeDto {
    type: string;
    displayName: string;
}

export interface DatabaseStats {
    totalSchemas: number;
    totalTables: number;
    totalViews: number;
    totalRecords: number;
}

export interface DatabaseUsageData {
    schemaName: string;
    tableCount: number;
    recordCount: number;
    size: number;
    lastModified: string;
}

export interface DashboardStats {
    totalUsers: number;
    totalActiveUsers: number;
    totalRoles: number;
    totalAudits: number;
    totalSchemas: number;
    totalTables: number;
    totalViews: number;
    totalRecords: number;
    last7DaysActivity: number;
}

export interface UserActivityData {
    date: string;
    activeUsers: number;
    newUsers: number;
    totalUsers: number;
}

export interface TopUsersByActivity {
    username: string;
    actionCount: number;
    lastActivity: string;
}

export interface RoleDistributionData {
    roleName: string;
    userCount: number;
}

export interface AuditActivityData {
    date: string;
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    activeUsers: number;
}

export interface AuditHeatmapData {
    dayOfWeek: number; // 1 = Monday, 2 = Tuesday, ... 7 = Sunday
    hourOfDay: number; // 0-23
    activityCount: number;
}

export type DatabaseTypeResponse = ApiResponse<DatabaseTypeDto>;
export type DatabaseStatsResponse = ApiResponse<DatabaseStats>;
export type DatabaseUsageResponse = ApiResponse<DatabaseUsageData[]>;
export type DashboardStatsResponse = ApiResponse<DashboardStats>;
export type UserActivityResponse = ApiResponse<UserActivityData[]>;
export type TopUsersByActivityResponse = ApiResponse<TopUsersByActivity[]>;
export type RoleDistributionResponse = ApiResponse<RoleDistributionData[]>;
export type AuditActivityResponse = ApiResponse<AuditActivityData[]>;
export type AuditHeatmapResponse = ApiResponse<AuditHeatmapData[]>;

// Query Parameters
export interface AnalyticsTimeRange {
    startDate?: string;
    endDate?: string;
    period?: 'hour' | 'day' | 'week' | 'month';
}
