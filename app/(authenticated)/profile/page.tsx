"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Shield, User } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks";
import { PermissionBadge } from "@/components/common/permission-badge";
import type { PermissionDetailDto, RoleDto } from "@/lib/types";
import { ErrorMessage } from "@/components/common";

export default function ProfilePage() {
  const { data: currentUser, isLoading, isError } = useCurrentUser();

  const aggregatedPermissions: PermissionDetailDto[] = useMemo(() => {
    if (!currentUser?.roles) return [];
    const map = new Map<string, PermissionDetailDto>();
    currentUser.roles.forEach((role: RoleDto) => {
      role.permissions?.forEach(p => {
        const key = `${p.permissionType}::${p.schemaName || "*"}::${p.tableName || "*"}::${
          p.viewName || "*"
        }`;
        if (!map.has(key)) map.set(key, p);
      });
    });
    return Array.from(map.values());
  }, [currentUser]);

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <ErrorMessage error="Failed to load current user" />
      </div>
    );
  }

  if (!currentUser && !isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <ErrorMessage error="No user session found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          View your account information, roles and permissions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          {isLoading ? (
            <CardContent className="space-y-4">
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
            </CardContent>
          ) : (
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User ID</span>
                <span className="text-sm font-medium">#{currentUser!.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Username</span>
                <span className="text-sm font-medium">{currentUser!.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={currentUser!.active ? "default" : "secondary"}>
                  {currentUser!.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles ({currentUser?.roles?.length || 0})
            </CardTitle>
          </CardHeader>
          {isLoading ? (
            <CardContent className="space-y-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </CardContent>
          ) : (
            <CardContent>
              <div className="space-y-2">
                {currentUser?.roles && currentUser.roles.length > 0 ? (
                  currentUser.roles.map(role => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div>
                        <span className="font-medium text-sm text-primary">{role.name}</span>
                        {role.description && (
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        )}
                      </div>
                      <Badge variant={role.isSystemRole ? "destructive" : "default"}>
                        {role.isSystemRole ? "SYSTEM" : "CUSTOM"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">You have no roles assigned.</p>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Aggregated Permissions ({aggregatedPermissions.length})
          </CardTitle>
        </CardHeader>
        {isLoading ? (
          <CardContent className="space-x-2 space-y-2 max-h-48">
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
          </CardContent>
        ) : (
          <CardContent>
            <div className="space-x-2 space-y-2 max-h-48 overflow-y-auto">
              {aggregatedPermissions.length > 0 ? (
                aggregatedPermissions.map((p, i) => <PermissionBadge key={i} permission={p} />)
              ) : (
                <p className="text-sm text-muted-foreground">No permissions from your roles.</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
