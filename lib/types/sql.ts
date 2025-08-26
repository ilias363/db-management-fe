// SQL execution

import { ApiResponse } from "./common";

export interface SqlExecutionRequestDto {
    sql: string;
    maxRows?: number;
}

export interface SqlResultSetDto {
    columns: string[];
    rows: Record<string, unknown>[];
    rowCount: number;
    executionTimeMs: number;
    statementType: string; // e.g., SELECT, INSERT, UPDATE, DELETE
}

export type SqlExecutionResponse = ApiResponse<SqlResultSetDto>;