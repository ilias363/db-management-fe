import { useQuery, useQueryClient } from "@tanstack/react-query";
import { tableQueries } from "@/lib/queries";

export function useTables(schemaName: string, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...tableQueries.list(schemaName),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: tableQueries.list(schemaName).queryKey,
        }),
    };
}

export function useTable(schemaName: string, tableName: string, options?: { enabled?: boolean }) {
    const queryClient = useQueryClient();

    const query = useQuery({
        ...tableQueries.detail(schemaName, tableName),
        enabled: options?.enabled ?? true,
    });

    return {
        ...query,
        invalidate: () => queryClient.invalidateQueries({
            queryKey: tableQueries.detail(schemaName, tableName).queryKey,
        }),
    };
}
