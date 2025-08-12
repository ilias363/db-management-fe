"use server";

import { TableListDto, TableMetadataDto } from "@/lib/types/database";
import { withAuth } from "../auth-utils";
import { apiClient } from "@/lib/api-client";

export async function getAllTablesInSchema(schemaName: string): Promise<TableListDto | null> {
    const authAction = await withAuth(async (): Promise<TableListDto | null> => {
        try {
            const response = await apiClient.table.getAllTablesInSchema(schemaName);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error('Failed to get tables:', error);
            return null;
        }
    });

    return authAction();
}

export async function getTable(schemaName: string, tableName: string): Promise<TableMetadataDto | null> {
    const authAction = await withAuth(async (): Promise<TableMetadataDto | null> => {
        try {
            const response = await apiClient.table.getTable(schemaName, tableName);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error('Failed to get table:', error);
            return null;
        }
    });

    return authAction();
}