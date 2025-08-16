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

  await queryClient.prefetchQuery(authQueries.detailedPermissionsQuery(schemaName));

  const permissions = queryClient.getQueryData(
    authQueries.detailedPermissionsQuery(schemaName).queryKey
  );

  if (permissions?.granularPermissions.canRead) {
    await queryClient.prefetchQuery(schemaQueries.detail(schemaName));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SchemaDetailsPageContent schemaName={schemaName} />
    </HydrationBoundary>
  );
}
