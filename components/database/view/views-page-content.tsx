"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { View, Plus, Search, Database } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDbPermissions, useSchemas, useDetailedPermissions, useViews } from "@/lib/hooks";
import { ViewCard } from "./view-card";
import { LastUpdated } from "@/components/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { toast } from "sonner";

export function ViewsPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const prevFetchingRef = useRef(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedSchema, setSelectedSchemaState] = useState<string>(
    searchParams.get("schema") || ""
  );

  const setSelectedSchema = (schema: string) => {
    setSelectedSchemaState(schema);
    const params = new URLSearchParams(searchParams);
    if (schema) {
      params.set("schema", schema);
    } else {
      params.delete("schema");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const schemaFromUrl = searchParams.get("schema") || "";
    if (schemaFromUrl !== selectedSchema) {
      setSelectedSchemaState(schemaFromUrl);
    }
  }, [searchParams, selectedSchema]);

  const { data: perms, isLoading: permsLoading, isError: permsError } = useDbPermissions();

  const {
    data: schemasData,
    isLoading: schemasLoading,
    isError: schemasError,
    refetch: refetchSchemas,
  } = useSchemas(true, { enabled: !!perms?.hasDbReadAccess });

  const {
    data: viewsData,
    isLoading: viewsLoading,
    isError: viewsError,
    refetch: refetchViews,
    isFetching: viewsFetching,
  } = useViews(selectedSchema, { enabled: !!selectedSchema });

  useEffect(() => {
    if (prevFetchingRef.current && !viewsFetching) {
      setFetchTrigger(prev => prev + 1);
    }
    prevFetchingRef.current = viewsFetching;
  }, [viewsFetching]);

  const schemas = schemasData?.schemas || [];
  const views = viewsData?.views || [];

  const selectedSchemaData = schemas.find(s => s.schemaName === selectedSchema);

  const { data: detailedPerms } = useDetailedPermissions(selectedSchema, undefined, {
    enabled: !!selectedSchema,
  });

  const canCreateView = detailedPerms?.granularPermissions.canCreate || false;

  const handleRefresh = () => {
    refetchSchemas();
    refetchViews();
  };

  const filteredViews = views.filter(view =>
    view.viewName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userSchemas = schemas.filter(schema => !schema.isSystemSchema);
  const systemSchemas = schemas.filter(schema => schema.isSystemSchema);

  const handleCreateView = () => {
    toast.info("Create View functionality to be implemented", {
      description: "This feature is coming soon.",
    });
  };

  if (!permsLoading && !perms?.hasDbReadAccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">View Management</h2>
            <p className="text-muted-foreground">Manage database views and their properties</p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-8">
            <View className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">No Database Access</h3>
            <p className="text-muted-foreground">
              You don&apos;t have permission to view database views. Contact your administrator for
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
          <h2 className="text-2xl font-bold tracking-tight">View Management</h2>
          <p className="text-muted-foreground">Manage database views and their properties</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            className="gap-2"
            disabled={!canCreateView || !selectedSchema}
            onClick={handleCreateView}
          >
            <Plus className="h-4 w-4" />
            Create View
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
                placeholder="Search views..."
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
                  <SelectItem value="loading" disabled>
                    Loading schemas...
                  </SelectItem>
                ) : schemasError ? (
                  <SelectItem value="error" disabled>
                    Error loading schemas
                  </SelectItem>
                ) : schemas.length === 0 ? (
                  <SelectItem value="no-schemas" disabled>
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
              Choose a schema from the dropdown above to view its views.
            </p>
          </CardContent>
        </Card>
      ) : viewsLoading ? (
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
      ) : viewsError ? (
        <Card>
          <CardContent className="text-center py-8">
            <View className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">Failed to Load Views</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the views for schema &quot;{selectedSchema}&quot;. Please
              try again.
            </p>
            <Button
              onClick={() => {
                refetchViews();
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredViews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <View className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">
              {views.length === 0 ? "No Views Found" : "No Matching Views"}
            </h3>
            <p className="text-muted-foreground">
              {views.length === 0
                ? `There are no views in the &quot;{selectedSchema}&quot; schema.`
                : "Try adjusting your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
          {filteredViews.map(view => (
            <ViewCard
              key={view.viewName}
              schemaName={selectedSchema}
              viewName={view.viewName}
              isSystemSchema={selectedSchemaData?.isSystemSchema || false}
              className="mb-6 break-inside-avoid"
            />
          ))}
        </div>
      )}
    </div>
  );
}
