import { queryOptions } from "@tanstack/react-query";
import { getDatabaseStats } from "../actions";

export const analyticsQueries = {
    all: () => ["analytics"] as const,
    stats: () => [...analyticsQueries.all(), "stats"] as const,
    statsWithSystem: (includeSystem: boolean) =>
        queryOptions({
            queryKey: [...analyticsQueries.stats(), { includeSystem }],
            queryFn: () => getDatabaseStats(includeSystem),
            staleTime: 5 * 60 * 1000,
            retry: 2,
        }),
};
