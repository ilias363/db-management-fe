import { queryOptions } from "@tanstack/react-query";
import { PaginationParams } from "../types";
import {
    advancedSearchTableRecords,
    advancedSearchViewRecords,
    getTableRecordCount,
    getTableRecords,
    getTableRecordsByValues,
    getViewRecordCount,
    getViewRecords,
    getViewRecordsByValues,
} from "../actions/database";
import { RecordAdvancedSearchDto } from "../types/database";

export const recordQueries = {
    all: () => ["records"] as const,
    allForTable: () => [...recordQueries.all(), "table"] as const,
    allForView: () => [...recordQueries.all(), "view"] as const,

    lists: () => [...recordQueries.all(), "list"] as const,
    listsForTables: () => [...recordQueries.lists(), "table"] as const,
    listsForViews: () => [...recordQueries.lists(), "view"] as const,
    listsForTable: (schemaName: string, tableName: string) =>
        [...recordQueries.listsForTables(), schemaName, tableName] as const,
    listsForView: (schemaName: string, viewName: string) =>
        [...recordQueries.listsForViews(), schemaName, viewName] as const,

    listForTable: (schemaName: string, tableName: string, params?: PaginationParams) =>
        queryOptions({
            queryKey: [...recordQueries.listsForTable(schemaName, tableName), params],
            queryFn: () => getTableRecords(schemaName, tableName, params),
            staleTime: 1000 * 60 * 2,
            retry: 2,
        }),
    listForView: (schemaName: string, viewName: string, params?: PaginationParams) =>
        queryOptions({
            queryKey: [...recordQueries.listsForView(schemaName, viewName), params],
            queryFn: () => getViewRecords(schemaName, viewName, params),
            staleTime: 1000 * 60 * 2,
            retry: 2,
        }),

    listByValuesForTable: (
        schemaName: string,
        tableName: string,
        identifyingValues: Record<string, unknown>,
        paginationParams?: PaginationParams
    ) =>
        queryOptions({
            queryKey: [
                ...recordQueries.listsForTable(schemaName, tableName),
                identifyingValues,
                paginationParams,
            ],
            queryFn: () =>
                getTableRecordsByValues(schemaName, tableName, identifyingValues, paginationParams),
            staleTime: 1000 * 60 * 2,
            retry: 2,
        }),
    listByValuesForView: (
        schemaName: string,
        viewName: string,
        identifyingValues: Record<string, unknown>,
        paginationParams?: PaginationParams
    ) =>
        queryOptions({
            queryKey: [
                ...recordQueries.listsForView(schemaName, viewName),
                identifyingValues,
                paginationParams,
            ],
            queryFn: () =>
                getViewRecordsByValues(schemaName, viewName, identifyingValues, paginationParams),
            staleTime: 1000 * 60 * 2,
            retry: 2,
        }),

    listSearchForTable: (search: RecordAdvancedSearchDto) =>
        queryOptions({
            queryKey: [...recordQueries.listsForTable(search.schemaName, search.objectName), search],
            queryFn: () => advancedSearchTableRecords(search),
            staleTime: 1000 * 60 * 2,
            retry: 2,
        }),
    listSearchForView: (search: RecordAdvancedSearchDto) =>
        queryOptions({
            queryKey: [...recordQueries.listsForView(search.schemaName, search.objectName), search],
            queryFn: () => advancedSearchViewRecords(search),
            staleTime: 1000 * 60 * 2,
            retry: 2,
        }),

    count: () => [...recordQueries.all(), "count"] as const,

    countForTable: (schemaName: string, tableName: string) =>
        queryOptions({
            queryKey: [...recordQueries.count(), "table", schemaName, tableName],
            queryFn: () => getTableRecordCount(schemaName, tableName),
            staleTime: 1000 * 60 * 2,
            retry: 2,
        }),
    countForView: (schemaName: string, viewName: string) =>
        queryOptions({
            queryKey: [...recordQueries.count(), "view", schemaName, viewName],
            queryFn: () => getViewRecordCount(schemaName, viewName),
            staleTime: 1000 * 60 * 2,
            retry: 2,
        }),
};
