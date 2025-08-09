import { queryOptions } from "@tanstack/react-query";
import { getAllSchemas, getSchema } from "@/lib/actions/database";

export const schemaQueries = {
    all: () => ["schemas"] as const,
    lists: () => [...schemaQueries.all(), "list"] as const,
    list: (includeSystem: boolean) =>
        queryOptions({
            queryKey: [...schemaQueries.lists(), { includeSystem }],
            queryFn: () => getAllSchemas(includeSystem),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),
    details: () => [...schemaQueries.all(), "detail"] as const,
    detail: (schemaName: string) =>
        queryOptions({
            queryKey: [...schemaQueries.details(), schemaName],
            queryFn: () => getSchema(schemaName),
            staleTime: 10 * 60 * 1000,
            retry: 2,
        }),
};
