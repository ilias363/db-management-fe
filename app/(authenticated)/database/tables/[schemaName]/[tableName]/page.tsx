import { TableDetailsPageContent } from "@/components/database";

interface TableDetailsPageProps {
  params: Promise<{
    schemaName: string;
    tableName: string;
  }>;
}

export default async function TableDetailsPage({ params }: TableDetailsPageProps) {
  const { schemaName, tableName } = await params;

  return <TableDetailsPageContent schemaName={schemaName} tableName={tableName} />;
}
