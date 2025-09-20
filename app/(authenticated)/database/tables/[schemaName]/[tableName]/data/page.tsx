import { TableDataContent } from "@/components/database/table";

interface PageProps {
  params: Promise<{
    schemaName: string;
    tableName: string;
  }>;
}

export default async function TableDataPage({ params }: PageProps) {
  const { schemaName, tableName } = await params;

  return <TableDataContent schemaName={schemaName} tableName={tableName} />;
}
