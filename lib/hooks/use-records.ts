import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationParams } from "../types";
import { recordQueries } from "../queries";
import { RecordAdvancedSearchDto } from "../types/database";

export function useTableRecords(
    schemaName: string,
    tableName: string,
    paginationParams?: PaginationParams,
    options?: {
        enabled?: boolean;
    }
) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...recordQueries.listForTable(schemaName, tableName, paginationParams),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () =>
            queryClient.invalidateQueries({
                queryKey: recordQueries.listsForTable(schemaName, tableName),
            }),
    };
}

export function useViewRecords(
    schemaName: string,
    viewName: string,
    paginationParams?: PaginationParams,
    options?: { enabled?: boolean }
) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...recordQueries.listForView(schemaName, viewName, paginationParams),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () =>
            queryClient.invalidateQueries({
                queryKey: recordQueries.listsForView(schemaName, viewName),
            }),
    };
}

export function useTableRecordsByValues(
    schemaName: string,
    tableName: string,
    identifyingValues: Record<string, unknown>,
    paginationParams?: PaginationParams,
    options?: { enabled?: boolean }
) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...recordQueries.listByValuesForTable(
            schemaName,
            tableName,
            identifyingValues,
            paginationParams
        ),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () =>
            queryClient.invalidateQueries({
                queryKey: recordQueries.listsForTable(schemaName, tableName),
            }),
    };
}

export function useViewRecordsByValues(
    schemaName: string,
    viewName: string,
    identifyingValues: Record<string, unknown>,
    paginationParams?: PaginationParams,
    options?: { enabled?: boolean }
) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...recordQueries.listByValuesForView(schemaName, viewName, identifyingValues, paginationParams),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () =>
            queryClient.invalidateQueries({
                queryKey: recordQueries.listsForView(schemaName, viewName),
            }),
    };
}

export function useTableRecordsSearch(
    search: RecordAdvancedSearchDto,
    options?: { enabled?: boolean }
) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...recordQueries.listSearchForTable(search),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () =>
            queryClient.invalidateQueries({
                queryKey: recordQueries.listsForTable(search.schemaName, search.objectName),
            }),
    };
}

export function useViewRecordsSearch(
    search: RecordAdvancedSearchDto,
    options?: { enabled?: boolean }
) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...recordQueries.listSearchForView(search),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () =>
            queryClient.invalidateQueries({
                queryKey: recordQueries.listsForView(search.schemaName, search.objectName),
            }),
    };
}

export function useTableRecordCount(
    schemaName: string,
    tableName: string,
    options?: { enabled?: boolean }
) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...recordQueries.countForTable(schemaName, tableName),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () =>
            queryClient.invalidateQueries({
                queryKey: recordQueries.countForTable(schemaName, tableName).queryKey,
            }),
    };
}

export function useViewRecordCount(
    schemaName: string,
    viewName: string,
    options?: { enabled?: boolean }
) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...recordQueries.countForView(schemaName, viewName),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () =>
            queryClient.invalidateQueries({
                queryKey: recordQueries.countForView(schemaName, viewName).queryKey,
            }),
    };
}
