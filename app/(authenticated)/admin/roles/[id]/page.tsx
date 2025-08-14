import { roleQueries, authQueries } from "@/lib/queries";
import { getQueryClient } from "@/components/react-query/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { RoleDetailsPageContent } from "@/components/admin";

export const dynamic = "force-dynamic";

interface RoleDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleDetailsPage({ params }: RoleDetailsPageProps) {
  const { id } = await params;
  const roleId = parseInt(id, 10);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(authQueries.isSystemAdminQuery());

  const isAdmin = queryClient.getQueryData(authQueries.isSystemAdminQuery().queryKey);

  if (isAdmin && !isNaN(roleId)) {
    await queryClient.prefetchQuery(roleQueries.detail(roleId));

    await queryClient.prefetchQuery(
      roleQueries.roleUsers(roleId, {
        page: 0,
        size: 5,
        sortBy: "username",
        sortDirection: "ASC",
      })
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoleDetailsPageContent roleId={roleId} />
    </HydrationBoundary>
  );
}
