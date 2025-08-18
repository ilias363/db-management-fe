import { viewQueries, authQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ViewDetailsPageContent } from "@/components/database";

export const dynamic = "force-dynamic";

interface ViewDetailsPageProps {
  params: Promise<{
    schemaName: string;
    viewName: string;
  }>;
}

export default async function ViewDetailsPage({ params }: ViewDetailsPageProps) {
  const { schemaName, viewName } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(authQueries.detailedPermissionsQuery(schemaName, viewName));

  const permissions = queryClient.getQueryData(
    authQueries.detailedPermissionsQuery(schemaName, viewName).queryKey
  );

  if (permissions?.granularPermissions.canRead) {
    await queryClient.prefetchQuery(viewQueries.detail(schemaName, viewName));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ViewDetailsPageContent schemaName={schemaName} viewName={viewName} />
    </HydrationBoundary>
  );
}
