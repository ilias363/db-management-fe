import { schemaQueries, authQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import SchemasPageContent from "@/components/database/schemas-page-content";

export const dynamic = "force-dynamic";

export default async function SchemasPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(authQueries.permissionsQuery());

  const permissions = queryClient.getQueryData(authQueries.permissionsQuery().queryKey);

  // Only prefetch schemas if user has database read access
  if (permissions?.hasDbReadAccess) {
    await queryClient.prefetchQuery(schemaQueries.list(false));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SchemasPageContent />
    </HydrationBoundary>
  );
}
