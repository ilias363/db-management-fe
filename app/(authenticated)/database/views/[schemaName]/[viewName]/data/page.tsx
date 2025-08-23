import { ViewDataContent } from "@/components/database/view";
import { getQueryClient } from "@/components/react-query";
import { authQueries, recordQueries, viewQueries } from "@/lib/queries";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    schemaName: string;
    viewName: string;
  }>;
}

export default async function ViewDataPage({ params }: PageProps) {
  const { schemaName, viewName } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(authQueries.detailedPermissionsQuery(schemaName, viewName));

  const permissions = queryClient.getQueryData(
    authQueries.detailedPermissionsQuery(schemaName, viewName).queryKey
  );

  if (permissions?.granularPermissions.canRead) {
    await queryClient.prefetchQuery(viewQueries.detail(schemaName, viewName));
    await queryClient.prefetchQuery(
      recordQueries.listSearchForView({
        schemaName: schemaName,
        objectName: viewName,
        page: 0,
        size: 10,
      })
    );
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ViewDataContent schemaName={schemaName} viewName={viewName} />
    </HydrationBoundary>
  );
}
