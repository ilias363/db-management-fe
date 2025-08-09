// Record/data management related interfaces

import { ApiResponse, PageDto, SortDirection } from '../index';

export interface RecordDto {
    schemaName: string;
    tableName: string;
    data: Record<string, unknown>;
}

export interface RecordPageDto extends PageDto<Omit<RecordDto, 'schemaName' | 'tableName'>> {
    schemaName: string;
    tableName: string;
}

export interface ViewRecordPageDto extends PageDto<Omit<RecordDto, 'schemaName' | 'tableName'>> {
    schemaName: string;
    viewName: string;
}

export interface NewRecordDto {
    schemaName: string;
    tableName: string;
    data: Record<string, unknown>;
}

export interface UpdateRecordDto {
    schemaName: string;
    tableName: string;
    primaryKeyValues: Record<string, unknown>;
    data: Record<string, unknown>;
}

export interface DeleteRecordDto {
    schemaName: string;
    tableName: string;
    primaryKeyValues: Record<string, unknown>;
}

/*
 * Record update by values DTO
 */
export interface UpdateRecordByValuesDto {
    schemaName: string;
    tableName: string;
    identifyingValues: Record<string, unknown>;
    newData: Record<string, unknown>;
    allowMultiple?: boolean; // If true, allows updating multiple records with the same identifying values
}

export interface DeleteRecordByValuesDto {
    schemaName: string;
    tableName: string;
    identifyingValues: Record<string, unknown>;
    allowMultiple?: boolean; // If true, allows deleting multiple records with the same identifying values
}

export interface BatchNewRecordsDto {
    schemaName: string;
    tableName: string;
    records: Record<string, unknown>[];
}

export interface BatchUpdateRecordsDto {
    schemaName: string;
    tableName: string;
    updates: {
        primaryKeyValues: Record<string, unknown>;
        data: Record<string, unknown>;
    }[];
}

export interface BatchDeleteRecordsDto {
    schemaName: string;
    tableName: string;
    primaryKeyValuesList: Record<string, unknown>[];
}

export interface BatchUpdateRecordsByValuesDto {
    schemaName: string;
    tableName: string;
    updates: {
        newData: Record<string, unknown>;
        identifyingValues: Record<string, unknown>;
        allowMultiple?: boolean; // If true, allows updating multiple records with the same identifying values
    }[];
}

export interface BatchDeleteRecordsByValuesDto {
    schemaName: string;
    tableName: string;
    deletions: {
        identifyingValues: Record<string, unknown>;
        allowMultiple?: boolean; // If true, allows deleting multiple records with the same identifying values
    }[];
}

export interface RecordFilterCriteriaDto {
    columnName: string;
    operator: string; // FilterOperator enum value
    value?: unknown;
    values?: unknown[]; // For IN/NOT_IN operators
    minValue?: unknown; // For BETWEEN operator
    maxValue?: unknown; // For BETWEEN operator
    caseSensitive?: boolean;
}

export interface RecordSortCriteriaDto {
    columnName: string;
    direction: SortDirection;
}

export interface RecordAdvancedSearchDto {
    schemaName: string;
    tableName: string;
    page?: number;
    size?: number;
    sorts?: RecordSortCriteriaDto[];
    filters?: RecordFilterCriteriaDto[];
    globalSearch?: string; // Global search term to match against all text columns
    distinct?: boolean;
}

/*
*  Advanced record search response DTO
*/
export interface RecordAdvancedSearchResponseDto {
    records: Omit<RecordDto, 'schemaName' | 'tableName'>[];
    totalRecords: number;
    filteredRecords: number; // Records after filtering but before pagination
    currentPage: number;
    pageSize: number;
    totalPages: number;
    schemaName: string;
    tableName: string;

    hasfilters: boolean;
    hasSort: boolean;
    hasGlobalSearch: boolean;
    isDistinct: boolean;

    appliedFilters: RecordFilterCriteriaDto[];
    appliedSorts: RecordSortCriteriaDto[];
    appliedGlobalSearch: string;
}

export type RecordResponse = ApiResponse<RecordDto>;
export type RecordsResponse = ApiResponse<RecordDto[]>;
export type RecordPageResponse = ApiResponse<RecordPageDto>;
export type ViewRecordPageResponse = ApiResponse<ViewRecordPageDto>;
export type CountResponse = ApiResponse<number>;
export type RecordAdvancedSearchResponse = ApiResponse<RecordAdvancedSearchResponseDto>;
