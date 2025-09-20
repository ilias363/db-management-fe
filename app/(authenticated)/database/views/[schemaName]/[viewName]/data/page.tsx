import { ViewDataContent } from "@/components/database/view";

interface PageProps {
  params: Promise<{
    schemaName: string;
    viewName: string;
  }>;
}

export default async function ViewDataPage({ params }: PageProps) {
  const { schemaName, viewName } = await params;

  return <ViewDataContent schemaName={schemaName} viewName={viewName} />;
}
