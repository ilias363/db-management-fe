import { analyticsQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import DatabasePageContent from "@/components/database/database/database-page-content";

export const dynamic = "force-dynamic";

export default async function DatabasePage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(analyticsQueries.statsWithSystem(true));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DatabasePageContent />
    </HydrationBoundary>
  );
}
