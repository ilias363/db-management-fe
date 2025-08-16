import { tableQueries, authQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TableDetailsPageContent } from "@/components/database";

export const dynamic = "force-dynamic";

interface TableDetailsPageProps {
  params: Promise<{
    schemaName: string;
    tableName: string;
  }>;
}

export default async function TableDetailsPage({ params }: TableDetailsPageProps) {
  const queryClient = getQueryClient();
  const { schemaName, tableName } = await params;

  await queryClient.prefetchQuery(authQueries.detailedPermissionsQuery(schemaName, tableName));

  const permissions = queryClient.getQueryData(
    authQueries.detailedPermissionsQuery(schemaName, tableName).queryKey
  );

  if (permissions?.granularPermissions.canRead) {
    await queryClient.prefetchQuery(tableQueries.detail(schemaName, tableName));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TableDetailsPageContent schemaName={schemaName} tableName={tableName} />
    </HydrationBoundary>
  );
}
