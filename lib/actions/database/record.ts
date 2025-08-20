"use server";

import { apiClient } from "@/lib/api-client";
import { withAuth } from "@/lib/auth";
import { PaginationParams } from "@/lib/types";
import type {
    RecordAdvancedSearchDto,
    RecordAdvancedSearchResponseDto,
    TableRecordPageDto,
    ViewRecordPageDto,
} from "@/lib/types/database";

export async function getTableRecords(
    schemaName: string,
    tableName: string,
    params?: PaginationParams
): Promise<TableRecordPageDto | null> {
    const authAction = await withAuth(async (): Promise<TableRecordPageDto | null> => {
        try {
            const response = await apiClient.record.getTableRecords(schemaName, tableName, params);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get table records:", error);
            return null;
        }
    });

    return authAction();
}

export async function getViewRecords(
    schemaName: string,
    viewName: string,
    params?: PaginationParams
): Promise<ViewRecordPageDto | null> {
    const authAction = await withAuth(async (): Promise<ViewRecordPageDto | null> => {
        try {
            const response = await apiClient.record.getViewRecords(schemaName, viewName, params);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get view records:", error);
            return null;
        }
    });

    return authAction();
}

export async function getTableRecordsByValues(
    schemaName: string,
    tableName: string,
    identifyingValues: Record<string, unknown>,
    paginationParams?: PaginationParams
): Promise<TableRecordPageDto | null> {
    const authAction = await withAuth(async (): Promise<TableRecordPageDto | null> => {
        try {
            const response = await apiClient.record.getTableRecordsByValues(
                schemaName,
                tableName,
                identifyingValues,
                paginationParams
            );
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get table records by values:", error);
            return null;
        }
    });

    return authAction();
}

export async function getViewRecordsByValues(
    schemaName: string,
    viewName: string,
    identifyingValues: Record<string, unknown>,
    paginationParams?: PaginationParams
): Promise<ViewRecordPageDto | null> {
    const authAction = await withAuth(async (): Promise<ViewRecordPageDto | null> => {
        try {
            const response = await apiClient.record.getViewRecordsByValues(
                schemaName,
                viewName,
                identifyingValues,
                paginationParams
            );
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get view records by values:", error);
            return null;
        }
    });

    return authAction();
}

export async function getTableRecordCount(
    schemaName: string,
    tableName: string
): Promise<number | null> {
    const authAction = await withAuth(async (): Promise<number | null> => {
        try {
            const response = await apiClient.record.getTableRecordCount(schemaName, tableName);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get table record count:", error);
            return null;
        }
    });

    return authAction();
}

export async function getViewRecordCount(
    schemaName: string,
    viewName: string
): Promise<number | null> {
    const authAction = await withAuth(async (): Promise<number | null> => {
        try {
            const response = await apiClient.record.getViewRecordCount(schemaName, viewName);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get view record count:", error);
            return null;
        }
    });

    return authAction();
}

export async function advancedSearchTableRecords(
    searchRequest: RecordAdvancedSearchDto
): Promise<RecordAdvancedSearchResponseDto | null> {
    const authAction = await withAuth(async (): Promise<RecordAdvancedSearchResponseDto | null> => {
        try {
            const response = await apiClient.record.advancedSearchTable(searchRequest);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to perform advanced search on table records:", error);
            return null;
        }
    });

    return authAction();
}

export async function advancedSearchViewRecords(
    searchRequest: RecordAdvancedSearchDto
): Promise<RecordAdvancedSearchResponseDto | null> {
    const authAction = await withAuth(async (): Promise<RecordAdvancedSearchResponseDto | null> => {
        try {
            const response = await apiClient.record.advancedSearchView(searchRequest);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to perform advanced search on view records:", error);
            return null;
        }
    });

    return authAction();
}
