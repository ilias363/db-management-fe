import { userQueries, authQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { UserDetailsPageContent } from "@/components/admin";
import { SortDirection } from "@/lib/types";

export const dynamic = "force-dynamic";

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(authQueries.isSystemAdminQuery());

  const isAdmin = queryClient.getQueryData(authQueries.isSystemAdminQuery().queryKey);

  if (isAdmin && !isNaN(userId)) {
    await queryClient.prefetchQuery(userQueries.detail(userId));

    await queryClient.prefetchQuery(
      userQueries.userAudits(userId, {
        page: 0,
        size: 10,
        sortBy: "auditTimestamp",
        sortDirection: SortDirection.DESC,
      })
    );

    await queryClient.prefetchQuery(userQueries.allRoles());
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserDetailsPageContent userId={userId} />
    </HydrationBoundary>
  );
}
