import { SchemaDetailsPageContent } from "@/components/database";

interface SchemaDetailsPageProps {
  params: Promise<{ schemaName: string }>;
}

export default async function SchemaDetailsPage({ params }: SchemaDetailsPageProps) {
  const { schemaName } = await params;

  return <SchemaDetailsPageContent schemaName={schemaName} />;
}
