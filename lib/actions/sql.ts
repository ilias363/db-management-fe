"use server";

import { apiClient } from "../api-client";
import { SqlExecutionRequestDto, SqlExecutionResponse } from "../types";

export async function executeSql(req: SqlExecutionRequestDto): Promise<SqlExecutionResponse> {
    try {
        const res = await apiClient.sql.execute(req);
        return res;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Execution failed";
        return {
            message,
            success: false,
            data: undefined,
        };
    }
}