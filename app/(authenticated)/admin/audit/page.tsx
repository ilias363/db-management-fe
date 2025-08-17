import { auditQueries, authQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AuditPageContent } from "@/components/admin";
import { SortDirection } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(authQueries.isSystemAdminQuery());

  const isAdmin = queryClient.getQueryData(authQueries.isSystemAdminQuery().queryKey);

  if (isAdmin) {
    await queryClient.prefetchQuery(
      auditQueries.list({
        page: 0,
        size: 10,
        sortBy: "auditTimestamp",
        sortDirection: SortDirection.DESC,
      })
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuditPageContent />
    </HydrationBoundary>
  );
}
