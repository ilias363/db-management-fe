// Audit logging related interfaces

import { ActionType, ApiResponse, PageDto, UserDto } from './index';

export interface AuditLogDto {
    id: number;
    user: UserDto;
    actionType: ActionType;
    auditTimestamp: string;
    successful: boolean;
    schemaName?: string;
    tableName?: string;
    objectName?: string;
    actionDetails?: string;
    errorMessage?: string;
}

export interface AuditStats {
    totalAudits: number;
    totalSuccessful: number;
    totalFailed: number;
    failedPercentage: number;
    last24hActivityCount: number;
    mostCommonAction: ActionType;
    averageActionsPerDay: number;
}

export type AuditLogPageDto = PageDto<AuditLogDto>

export type AuditLogResponse = ApiResponse<AuditLogDto>;
export type AuditLogPageResponse = ApiResponse<AuditLogPageDto>;
export type AuditStatsResponse = ApiResponse<AuditStats>;
