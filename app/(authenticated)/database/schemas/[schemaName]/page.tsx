import { schemaQueries, authQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SchemaDetailsPageContent } from "@/components/database";

export const dynamic = "force-dynamic";

interface SchemaDetailsPageProps {
  params: Promise<{ schemaName: string }>;
}

export default async function SchemaDetailsPage({ params }: SchemaDetailsPageProps) {
  const queryClient = getQueryClient();
  const { schemaName } = await params;

  // Always prefetch permissions first
  await queryClient.prefetchQuery(authQueries.permissionsQuery());

  // Get the prefetched permissions to check if user has DB access
  const permissions = queryClient.getQueryData(authQueries.permissionsQuery().queryKey);

  // Only prefetch schema details if user has database read access
  if (permissions?.hasDbReadAccess) {
    await queryClient.prefetchQuery(schemaQueries.detail(schemaName));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SchemaDetailsPageContent schemaName={schemaName} />
    </HydrationBoundary>
  );
}
