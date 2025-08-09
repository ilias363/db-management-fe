"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { databaseQueries } from "@/lib/queries";
import { useCallback } from "react";

export function useDatabaseStats(includeSystem: boolean = true) {
    const queryClient = useQueryClient();

    const query = useQuery(databaseQueries.statsWithSystem(includeSystem));

    const refetch = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: databaseQueries.stats(),
        });
    }, [queryClient]);

    return {
        ...query,
        refetch,
        invalidate,
    };
}
