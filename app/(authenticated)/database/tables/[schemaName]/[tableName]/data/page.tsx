import { TableDataContent } from "@/components/database/table";
import { getQueryClient } from "@/components/react-query";
import { authQueries, recordQueries, tableQueries } from "@/lib/queries";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    schemaName: string;
    tableName: string;
  }>;
}

export default async function TableDataPage({ params }: PageProps) {
  const { schemaName, tableName } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(authQueries.detailedPermissionsQuery(schemaName, tableName));

  const permissions = queryClient.getQueryData(
    authQueries.detailedPermissionsQuery(schemaName, tableName).queryKey
  );

  if (permissions?.granularPermissions.canRead) {
    await queryClient.prefetchQuery(tableQueries.detail(schemaName, tableName));
    await queryClient.prefetchQuery(
      recordQueries.listSearchForTable({
        schemaName: schemaName,
        objectName: tableName,
        page: 0,
        size: 10,
      })
    );
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TableDataContent schemaName={schemaName} tableName={tableName} />
    </HydrationBoundary>
  );
}
