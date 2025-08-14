import { queryOptions } from "@tanstack/react-query";
import { getAuditData, type AuditDataParams } from "@/lib/actions/audit";

export const auditQueries = {
    all: () => ["audit"] as const,

    lists: () => [...auditQueries.all(), "list"] as const,
    list: (params: AuditDataParams = {}) =>
        queryOptions({
            queryKey: [...auditQueries.lists(), params],
            queryFn: () => getAuditData(params),
            staleTime: 2 * 60 * 1000,
            retry: 2,
        }),
};
