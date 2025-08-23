"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    deleteRecord,
    deleteRecords,
    deleteRecordByValues,
    deleteRecordsByValues
} from "@/lib/actions/database/record";
import { recordQueries } from "@/lib/queries";
import { BaseTableColumnMetadataDto } from "@/lib/types/database";
import { ColumnType } from "@/lib/types";

type TableColumn = Omit<BaseTableColumnMetadataDto, "table">;

function getPrimaryKeyColumns(columns: TableColumn[]): TableColumn[] {
    return columns.filter(col =>
        col.columnType === ColumnType.PRIMARY_KEY ||
        col.columnType === ColumnType.PRIMARY_KEY_FOREIGN_KEY
    );
}

function getUniqueColumns(columns: TableColumn[]): TableColumn[] {
    return columns.filter(col =>
        col.isUnique &&
        col.columnType !== ColumnType.PRIMARY_KEY &&
        col.columnType !== ColumnType.PRIMARY_KEY_FOREIGN_KEY
    );
}

function extractPrimaryKeyValues(
    record: Record<string, unknown>,
    primaryKeyColumns: TableColumn[]
): Record<string, unknown> {
    const pkValues: Record<string, unknown> = {};
    primaryKeyColumns.forEach(column => {
        pkValues[column.columnName] = record[column.columnName];
    });
    return pkValues;
}

function extractUniqueValues(
    record: Record<string, unknown>,
    uniqueColumns: TableColumn[]
): Record<string, unknown> {
    if (uniqueColumns.length === 0) {
        // If no unique columns, return the whole record
        return record;
    }

    const uniqueColumn = uniqueColumns[0];
    return { [uniqueColumn.columnName]: record[uniqueColumn.columnName] };
}

interface UseDeleteRecordMutationProps {
    schemaName: string;
    tableName: string;
    columns: TableColumn[];
    onSuccess?: (deletedCount?: number) => void;
    onError?: (error: string) => void;
}

export function useDeleteRecordMutation({
    schemaName,
    tableName,
    columns,
    onSuccess,
    onError
}: UseDeleteRecordMutationProps) {
    const queryClient = useQueryClient();

    const primaryKeyColumns = getPrimaryKeyColumns(columns);
    const uniqueColumns = getUniqueColumns(columns);
    const hasPrimaryKey = primaryKeyColumns.length > 0;

    return useMutation({
        mutationFn: async (record: Record<string, unknown>) => {
            if (hasPrimaryKey) {
                const primaryKeyValues = extractPrimaryKeyValues(record, primaryKeyColumns);
                return await deleteRecord(schemaName, tableName, primaryKeyValues);
            } else {
                const identifyingValues = extractUniqueValues(record, uniqueColumns);
                return await deleteRecordByValues(schemaName, tableName, identifyingValues, false);
            }
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success(result.message);
                onSuccess?.('deletedCount' in result ? (result.deletedCount as number) : 1);

                queryClient.invalidateQueries({
                    queryKey: recordQueries.listsForTable(schemaName, tableName),
                });
                queryClient.invalidateQueries({
                    queryKey: recordQueries.countForTable(schemaName, tableName).queryKey,
                });
            } else {
                toast.error(result.message);
                onError?.(result.message);
            }
        },
        onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(errorMessage);
            onError?.(errorMessage);
        },
    });
}

interface UseDeleteRecordsMutationProps {
    schemaName: string;
    tableName: string;
    columns: TableColumn[];
    onSuccess?: (deletedCount?: number) => void;
    onError?: (error: string) => void;
}

export function useDeleteRecordsMutation({
    schemaName,
    tableName,
    columns,
    onSuccess,
    onError
}: UseDeleteRecordsMutationProps) {
    const queryClient = useQueryClient();

    const primaryKeyColumns = getPrimaryKeyColumns(columns);
    const uniqueColumns = getUniqueColumns(columns);
    const hasPrimaryKey = primaryKeyColumns.length > 0;

    return useMutation({
        mutationFn: async (records: Record<string, unknown>[]) => {
            if (hasPrimaryKey) {
                const primaryKeyValuesList = records.map(record =>
                    extractPrimaryKeyValues(record, primaryKeyColumns)
                );
                return await deleteRecords(schemaName, tableName, primaryKeyValuesList);
            } else {
                const deletions = records.map(record => ({
                    identifyingValues: extractUniqueValues(record, uniqueColumns),
                    allowMultiple: false
                }));
                return await deleteRecordsByValues(schemaName, tableName, deletions);
            }
        },
        onSuccess: (result, variables) => {
            if (result.success) {
                toast.success(result.message);
                onSuccess?.('deletedCount' in result ? (result.deletedCount as number) : variables.length);

                queryClient.invalidateQueries({
                    queryKey: recordQueries.listsForTable(schemaName, tableName),
                });
                queryClient.invalidateQueries({
                    queryKey: recordQueries.countForTable(schemaName, tableName).queryKey,
                });
            } else {
                toast.error(result.message);
                onError?.(result.message);
            }
        },
        onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            toast.error(errorMessage);
            onError?.(errorMessage);
        },
    });
}

// Hook to get delete strategy information for UI
export function useDeleteStrategy(columns: TableColumn[]) {
    const primaryKeyColumns = getPrimaryKeyColumns(columns);
    const uniqueColumns = getUniqueColumns(columns);
    const hasPrimaryKey = primaryKeyColumns.length > 0;

    return {
        hasPrimaryKey,
        primaryKeyColumns,
        uniqueColumns,
        canDelete: columns.length > 0,
        strategy: hasPrimaryKey
            ? 'primary-key'
            : uniqueColumns.length > 0
                ? 'unique-column'
                : 'full-record'
    };
}
