import { queryOptions } from "@tanstack/react-query";
import { getTable, getAllTablesInSchema } from "@/lib/actions/database";

export const tableQueries = {
    all: () => ["tables"] as const,
    lists: () => [...tableQueries.all(), "list"] as const,
    list: (schemaName: string) =>
        queryOptions({
            queryKey: [...tableQueries.lists(), schemaName],
            queryFn: () => getAllTablesInSchema(schemaName),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),
    details: () => [...tableQueries.all(), "detail"] as const,
    detail: (schemaName: string, tableName: string) =>
        queryOptions({
            queryKey: [...tableQueries.details(), schemaName, tableName],
            queryFn: () => getTable(schemaName, tableName),
            staleTime: 10 * 60 * 1000,
            retry: 2,
        }),
};
