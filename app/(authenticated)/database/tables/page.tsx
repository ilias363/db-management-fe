import { schemaQueries, authQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TablesPageContent } from "@/components/database";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(authQueries.permissionsQuery());

  const permissions = queryClient.getQueryData(authQueries.permissionsQuery().queryKey);

  // Only prefetch schemas if user has database read access
  if (permissions?.hasDbReadAccess) {
    await queryClient.prefetchQuery(schemaQueries.list(true));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TablesPageContent />
    </HydrationBoundary>
  );
}
