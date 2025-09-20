import { ViewDetailsPageContent } from "@/components/database";

interface ViewDetailsPageProps {
  params: Promise<{
    schemaName: string;
    viewName: string;
  }>;
}

export default async function ViewDetailsPage({ params }: ViewDetailsPageProps) {
  const { schemaName, viewName } = await params;

  return <ViewDetailsPageContent schemaName={schemaName} viewName={viewName} />;
}
