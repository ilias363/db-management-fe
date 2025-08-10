import { useQuery, useQueryClient } from "@tanstack/react-query";
import { schemaQueries } from "@/lib/queries";
import { useCallback } from "react";

export function useSchemas(includeSystem: boolean = false, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...schemaQueries.list(includeSystem),
        enabled: options?.enabled,
    });

    const refetch = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: schemaQueries.lists(),
        });
    }, [queryClient]);

    return {
        ...query,
        refetch,
        invalidate,
    };
}

export function useSchema(schemaName: string, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...schemaQueries.detail(schemaName),
        enabled: options?.enabled ?? true,
    });

    const refetch = useCallback(async () => {
        await query.refetch();
    }, [query]);

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: schemaQueries.details(),
        });
    }, [queryClient]);

    return {
        ...query,
        refetch,
        invalidate,
    };
}
