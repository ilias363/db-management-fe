"use server";

import { apiClient } from "@/lib/api-client";
import { withAuth } from "@/lib/auth";
import { PaginationParams } from "@/lib/types";
import type {
    RecordAdvancedSearchDto,
    RecordAdvancedSearchResponseDto,
    RecordDto,
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

interface CreateRecordResponse {
    success: boolean;
    message: string;
    data?: RecordDto;
}

export async function createRecord(
    schemaName: string,
    tableName: string,
    data: Record<string, unknown>
): Promise<CreateRecordResponse> {
    const authAction = await withAuth(async (): Promise<CreateRecordResponse> => {
        try {
            const response = await apiClient.record.createRecord({
                schemaName,
                tableName,
                data,
            });

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to create record",
                };
            }

            return {
                success: true,
                message: "Record created successfully",
                data: response.data,
            };
        } catch (error) {
            console.error("Failed to create record:", error);
            return {
                success: false,
                message: "An unexpected error occurred while creating the record",
            };
        }
    });

    return authAction();
}

interface CreateRecordsResponse {
    success: boolean;
    message: string;
    data?: RecordDto[];
    createdCount?: number;
}

export async function createRecords(
    schemaName: string,
    tableName: string,
    records: Record<string, unknown>[]
): Promise<CreateRecordsResponse> {
    const authAction = await withAuth(async (): Promise<CreateRecordsResponse> => {
        try {
            const response = await apiClient.record.createRecords({
                schemaName,
                tableName,
                records,
            });

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to create records",
                };
            }

            return {
                success: true,
                message: `Successfully created ${records.length} record(s)`,
                data: response.data,
                createdCount: records.length,
            };
        } catch (error) {
            console.error("Failed to create records:", error);
            return {
                success: false,
                message: "An unexpected error occurred while creating records",
            };
        }
    });

    return authAction();
}

interface DeleteRecordsResponse {
    success: boolean;
    message: string;
    deletedCount?: number;
}

export async function deleteRecord(
    schemaName: string,
    tableName: string,
    primaryKeyValues: Record<string, unknown>
): Promise<DeleteRecordsResponse> {
    const authAction = await withAuth(async (): Promise<DeleteRecordsResponse> => {
        try {
            const response = await apiClient.record.deleteRecord({
                schemaName,
                tableName,
                primaryKeyValues,
            });

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to delete record",
                };
            }

            return {
                success: true,
                message: "Record deleted successfully",
            };
        } catch (error) {
            console.error("Failed to delete record:", error);
            return {
                success: false,
                message: "An unexpected error occurred while deleting the record",
            };
        }
    });

    return authAction();
}

export async function deleteRecords(
    schemaName: string,
    tableName: string,
    primaryKeyValuesList: Record<string, unknown>[]
): Promise<DeleteRecordsResponse> {
    const authAction = await withAuth(async (): Promise<DeleteRecordsResponse> => {
        try {
            const response = await apiClient.record.deleteRecords({
                schemaName,
                tableName,
                primaryKeyValuesList,
            });

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to delete records",
                };
            }

            return {
                success: true,
                message: `Successfully deleted ${response.data} record(s)`,
                deletedCount: response.data,
            };
        } catch (error) {
            console.error("Failed to delete records:", error);
            return {
                success: false,
                message: "An unexpected error occurred while deleting records",
            };
        }
    });

    return authAction();
}

export async function deleteRecordByValues(
    schemaName: string,
    tableName: string,
    identifyingValues: Record<string, unknown>,
    allowMultiple: boolean = false
): Promise<DeleteRecordsResponse> {
    const authAction = await withAuth(async (): Promise<DeleteRecordsResponse> => {
        try {
            const response = await apiClient.record.deleteRecordByValues({
                schemaName,
                tableName,
                identifyingValues,
                allowMultiple,
            });

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to delete record(s) by values",
                };
            }

            const count = response.data || 0;
            return {
                success: true,
                message: `Successfully deleted ${count} record(s)`,
                deletedCount: count,
            };
        } catch (error) {
            console.error("Failed to delete record by values:", error);
            return {
                success: false,
                message: "An unexpected error occurred while deleting record(s)",
            };
        }
    });

    return authAction();
}

export async function deleteRecordsByValues(
    schemaName: string,
    tableName: string,
    deletions: {
        identifyingValues: Record<string, unknown>;
        allowMultiple?: boolean;
    }[]
): Promise<DeleteRecordsResponse> {
    const authAction = await withAuth(async (): Promise<DeleteRecordsResponse> => {
        try {
            const response = await apiClient.record.deleteRecordsByValues({
                schemaName,
                tableName,
                deletions,
            });

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to delete records by values",
                };
            }

            const count = response.data || 0;
            return {
                success: true,
                message: `Successfully deleted ${count} record(s)`,
                deletedCount: count,
            };
        } catch (error) {
            console.error("Failed to delete records by values:", error);
            return {
                success: false,
                message: "An unexpected error occurred while deleting records",
            };
        }
    });

    return authAction();
}
