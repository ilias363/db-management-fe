import { useQuery, useQueryClient } from "@tanstack/react-query";
import { viewQueries } from "@/lib/queries";

export function useViews(schemaName: string, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...viewQueries.list(schemaName),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: viewQueries.list(schemaName).queryKey,
        }),
    };
}

export function useView(schemaName: string, viewName: string, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...viewQueries.detail(schemaName, viewName),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: viewQueries.detail(schemaName, viewName).queryKey,
        }),
    };
}
