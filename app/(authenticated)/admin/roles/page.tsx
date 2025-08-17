import { roleQueries, authQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { RolesPageContent } from "@/components/admin";
import { SortDirection } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(authQueries.isSystemAdminQuery());

  const isAdmin = queryClient.getQueryData(authQueries.isSystemAdminQuery().queryKey);

  if (isAdmin) {
    await queryClient.prefetchQuery(
      roleQueries.list({
        page: 0,
        size: 5,
        sortBy: "id",
        sortDirection: SortDirection.ASC,
        search: "",
      })
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RolesPageContent />
    </HydrationBoundary>
  );
}
