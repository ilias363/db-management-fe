import { databaseQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import DatabasePageContent from "@/components/database/database-page-content";

export default async function DatabasePage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(databaseQueries.statsWithSystem(true));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DatabasePageContent />
    </HydrationBoundary>
  );
}
