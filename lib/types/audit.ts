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

export type AuditLogPageDto = PageDto<AuditLogDto>

export type AuditLogResponse = ApiResponse<AuditLogDto>;
export type AuditLogPageResponse = ApiResponse<AuditLogPageDto>;
