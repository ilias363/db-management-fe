import { queryOptions } from "@tanstack/react-query";
import { getView, getAllViewsInSchema } from "@/lib/actions/database";

export const viewQueries = {
    all: () => ["views"] as const,
    lists: () => [...viewQueries.all(), "list"] as const,
    list: (schemaName: string) =>
        queryOptions({
            queryKey: [...viewQueries.lists(), schemaName],
            queryFn: () => getAllViewsInSchema(schemaName),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),
    details: () => [...viewQueries.all(), "detail"] as const,
    detail: (schemaName: string, viewName: string) =>
        queryOptions({
            queryKey: [...viewQueries.details(), schemaName, viewName],
            queryFn: () => getView(schemaName, viewName),
            staleTime: 10 * 60 * 1000,
            retry: 2,
        }),
};
