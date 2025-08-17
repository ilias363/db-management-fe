import { userQueries, authQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { UsersPageContent } from "@/components/admin";
import { SortDirection } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(authQueries.isSystemAdminQuery());

  const isAdmin = queryClient.getQueryData(authQueries.isSystemAdminQuery().queryKey);

  if (isAdmin) {
    await queryClient.prefetchQuery(
      userQueries.list({
        page: 0,
        size: 5,
        sortBy: "username",
        sortDirection: SortDirection.ASC,
        search: "",
        activeOnly: false,
      })
    );
    await queryClient.prefetchQuery(userQueries.allRoles());
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersPageContent />
    </HydrationBoundary>
  );
}
