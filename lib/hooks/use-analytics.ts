import { useQuery, useQueryClient } from "@tanstack/react-query";
import { analyticsQueries } from "../queries";
import { useCallback } from "react";

export function useDatabaseStats(includeSystem: boolean = true) {
    const queryClient = useQueryClient();

    const query = useQuery(analyticsQueries.statsWithSystem(includeSystem));

    const refetch = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: analyticsQueries.stats(),
        });
    }, [queryClient]);

    return {
        ...query,
        refetch,
        invalidate,
    };
}
