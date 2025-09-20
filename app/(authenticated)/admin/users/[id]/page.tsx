import { UserDetailsPageContent } from "@/components/admin";

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  return <UserDetailsPageContent userId={userId} />;
}
