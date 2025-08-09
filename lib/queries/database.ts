import { queryOptions } from "@tanstack/react-query";
import { getDatabaseStats } from "@/lib/actions/database";

export const databaseQueries = {
    all: () => ["database"] as const,
    stats: () => [...databaseQueries.all(), "stats"] as const,
    statsWithSystem: (includeSystem: boolean) =>
        queryOptions({
            queryKey: [...databaseQueries.stats(), { includeSystem }],
            queryFn: () => getDatabaseStats(includeSystem),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),
};
