"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Plus, Search, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDbPermissions, useSchemas, useDetailedPermissions } from "@/lib/hooks";
import { SchemaCard, SchemaDialog } from "@/components/database";
import { LastUpdated } from "@/components/common";

export function SchemasPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSystemSchemas, setShowSystemSchemas] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const prevFetchingRef = useRef(false);

  const { data: perms, isLoading: permsLoading, isError: permsError } = useDbPermissions();

  // Only fetch schemas if user has db read access
  const {
    data,
    isLoading: schemasLoading,
    isError: schemasError,
    refetch: refetchSchemas,
    isFetching: schemasFetching,
  } = useSchemas(showSystemSchemas, { enabled: !!perms?.hasDbReadAccess });

  // Track when a server fetch completes to update the LastUpdated component
  useEffect(() => {
    if (prevFetchingRef.current && !schemasFetching) {
      setFetchTrigger(prev => prev + 1);
    }
    prevFetchingRef.current = schemasFetching;
  }, [schemasFetching]);

  const { data: detailedPerms } = useDetailedPermissions();

  const schemas = data?.schemas || [];

  const canCreateSchema = detailedPerms?.granularPermissions.canCreate || false;

  const filteredSchemas = schemas.filter(schema => {
    const matchesSearch = schema.schemaName.toLowerCase().includes(searchTerm.toLowerCase());
    const isVisible = showSystemSchemas || !schema.isSystemSchema;
    return matchesSearch && isVisible;
  });

  const handleRefresh = () => {
    refetchSchemas();
  };

  const handleCreateSuccess = () => {
    refetchSchemas();
  };

  if (!permsLoading && !perms?.hasDbReadAccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Schema Management</h2>
            <p className="text-muted-foreground">
              Manage database schemas and their contained objects
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-8">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">No Database Access</h3>
            <p className="text-muted-foreground">
              You don&apos;t have permission to view database schemas. Contact your administrator
              for access.
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
          <h2 className="text-2xl font-bold tracking-tight">Schema Management</h2>
          <p className="text-muted-foreground">
            Manage database schemas and their contained objects
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            className="gap-2"
            disabled={!canCreateSchema}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Schema
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
                placeholder="Search schemas..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant={showSystemSchemas ? "default" : "outline"}
              onClick={() => setShowSystemSchemas(!showSystemSchemas)}
              className="gap-2"
              disabled={schemasLoading}
            >
              <Shield className="h-4 w-4" />
              System Schemas
            </Button>
            {permsLoading && <Skeleton className="h-8 w-24" />}
            {permsError && <span className="text-xs text-destructive">Perms failed</span>}
            {schemasError && (
              <span className="text-xs text-destructive">Failed to load schemas</span>
            )}
          </div>
        </CardContent>
      </Card>

      {schemasLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
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
      ) : schemasError ? (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">Failed to Load Schemas</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the schemas. Please try again.
            </p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </CardContent>
        </Card>
      ) : filteredSchemas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">
              {schemas.length === 0 ? "No Schemas Found" : "No Matching Schemas"}
            </h3>
            <p className="text-muted-foreground">
              {schemas.length === 0
                ? "There are no schemas in this database."
                : "Try adjusting your search or filter criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemas.map(schema => (
            <SchemaCard key={schema.schemaName} schema={schema} />
          ))}
        </div>
      )}

      <SchemaDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
