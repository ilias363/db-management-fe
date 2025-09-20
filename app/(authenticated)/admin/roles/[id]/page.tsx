import { RoleDetailsPageContent } from "@/components/admin";

interface RoleDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleDetailsPage({ params }: RoleDetailsPageProps) {
  const { id } = await params;
  const roleId = parseInt(id, 10);

  return <RoleDetailsPageContent roleId={roleId} />;
}
