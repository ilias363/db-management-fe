"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, Plus, Search, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDbPermissions, useSchemas, useDetailedPermissions, useTables } from "@/lib/hooks";
import { TableCard } from "@/components/database";
import { LastUpdated } from "@/components/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";

export function TablesPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchema, setSelectedSchema] = useState<string>("");
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const prevFetchingRef = useRef(false);

  const { data: perms, isLoading: permsLoading, isError: permsError } = useDbPermissions();

  const {
    data: schemasData,
    isLoading: schemasLoading,
    isError: schemasError,
    refetch: refetchSchemas,
  } = useSchemas(true, { enabled: !!perms?.hasDbReadAccess });

  const {
    data: tablesData,
    isLoading: tablesLoading,
    isError: tablesError,
    refetch: refetchTables,
    isFetching: tablesFetching,
  } = useTables(selectedSchema, { enabled: !!selectedSchema });

  useEffect(() => {
    if (prevFetchingRef.current && !tablesFetching) {
      setFetchTrigger(prev => prev + 1);
    }
    prevFetchingRef.current = tablesFetching;
  }, [tablesFetching]);

  const schemas = schemasData?.schemas || [];
  const tables = tablesData?.tables || [];

  const selectedSchemaData = schemas.find(s => s.schemaName === selectedSchema);

  const { data: detailedPerms } = useDetailedPermissions(selectedSchema, undefined, {
    enabled: !!selectedSchema,
  });

  const canCreateTable = detailedPerms?.granularPermissions.canCreate || false;

  const handleRefresh = () => {
    refetchSchemas();
    refetchTables();
  };

  const filteredTables = tables.filter(table =>
    table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userSchemas = schemas.filter(schema => !schema.isSystemSchema);
  const systemSchemas = schemas.filter(schema => schema.isSystemSchema);

  if (!permsLoading && !perms?.hasDbReadAccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Table Management</h2>
            <p className="text-muted-foreground">Manage database tables, columns, and data</p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-8">
            <Table className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">No Database Access</h3>
            <p className="text-muted-foreground">
              You don&apos;t have permission to view database tables. Contact your administrator for
              access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Table Management</h2>
          <p className="text-muted-foreground">Manage database tables, columns, and data</p>
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm" className="gap-2" disabled={!canCreateTable || !selectedSchema}>
            <Plus className="h-4 w-4" />
            Create Table
          </Button>
          <LastUpdated onRefresh={handleRefresh} resetTrigger={fetchTrigger} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
                disabled={!selectedSchema}
              />
            </div>
            <Select value={selectedSchema} onValueChange={setSelectedSchema}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select schema" />
              </SelectTrigger>
              <SelectContent>
                {schemasLoading ? (
                  <SelectItem value="" disabled>
                    Loading schemas...
                  </SelectItem>
                ) : schemasError ? (
                  <SelectItem value="" disabled>
                    Error loading schemas
                  </SelectItem>
                ) : schemas.length === 0 ? (
                  <SelectItem value="" disabled>
                    No schemas available
                  </SelectItem>
                ) : (
                  <>
                    {systemSchemas.map(schema => (
                      <SelectItem key={schema.schemaName} value={schema.schemaName}>
                        <div className="flex items-center gap-2">
                          {schema.schemaName}
                          <span className="text-xs text-muted-foreground">(System)</span>
                        </div>
                      </SelectItem>
                    ))}
                    {userSchemas.length > 0 && systemSchemas.length > 0 && <SelectSeparator />}
                    {userSchemas.map(schema => (
                      <SelectItem key={schema.schemaName} value={schema.schemaName}>
                        {schema.schemaName}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            {permsLoading && <Skeleton className="h-8 w-24" />}
            {permsError && <span className="text-xs text-destructive">Perms failed</span>}
            {schemasError && (
              <span className="text-xs text-destructive">Failed to load schemas</span>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedSchema ? (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">Select a Schema</h3>
            <p className="text-muted-foreground">
              Choose a schema from the dropdown above to view its tables.
            </p>
          </CardContent>
        </Card>
      ) : tablesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-8 w-full mt-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tablesError ? (
        <Card>
          <CardContent className="text-center py-8">
            <Table className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">Failed to Load Tables</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the tables for schema &quot;{selectedSchema}&quot;. Please
              try again.
            </p>
            <Button
              onClick={() => {
                refetchTables();
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredTables.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Table className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">
              {tables.length === 0 ? "No Tables Found" : "No Matching Tables"}
            </h3>
            <p className="text-muted-foreground">
              {tables.length === 0
                ? `There are no tables in the &quot;{selectedSchema}&quot; schema.`
                : "Try adjusting your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map(table => (
            <TableCard
              key={table.tableName}
              schemaName={selectedSchema}
              tableName={table.tableName}
              isSystemSchema={selectedSchemaData?.isSystemSchema || false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
