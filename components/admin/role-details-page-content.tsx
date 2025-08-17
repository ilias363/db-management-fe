"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Users, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { UserDto, SortDirection } from "@/lib/types";

import { LastUpdated } from "@/components/common/last-updated";
import { PermissionBadge } from "@/components/common/permission-badge";
import { Separator } from "@/components/ui/separator";
import { RoleDialog } from "@/components/role/role-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, ColumnDef, ActionButton } from "@/components/common/data-table";
import { deleteRole } from "@/lib/actions/role";
import { useRoleDetail, useRoleUsers } from "@/lib/hooks";
import { ErrorMessage } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { roleQueries } from "@/lib/queries";

interface RoleDetailsPageContentProps {
  roleId: number;
}

export function RoleDetailsPageContent({ roleId }: RoleDetailsPageContentProps) {
  const router = useRouter();

  const [currentUsersPage, setCurrentUsersPage] = useState(0);
  const [pageSize] = useState(5);
  const [usersSortBy, setUsersSortBy] = useState<string>("username");
  const [usersSortDirection, setUsersSortDirection] = useState<SortDirection>(SortDirection.ASC);

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [fetchTrigger, setFetchTrigger] = useState(0);
  const prevFetchingRef = useRef(false);

  const queryClient = useQueryClient();

  const {
    data: roleResponse,
    isLoading: roleLoading,
    isError: roleError,
    error: roleErrorData,
    refetch: refetchRole,
  } = useRoleDetail(roleId);

  const {
    data: usersResponse,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
    isFetching: usersFetching,
  } = useRoleUsers(roleId, {
    page: currentUsersPage,
    size: pageSize,
    sortBy: usersSortBy,
    sortDirection: usersSortDirection,
  });

  useEffect(() => {
    if (prevFetchingRef.current && !usersFetching) {
      setFetchTrigger(prev => prev + 1);
    }
    prevFetchingRef.current = usersFetching;
  }, [usersFetching]);

  const role = roleResponse?.data;
  const roleUsers = usersResponse?.data?.items || [];
  const totalUsers = usersResponse?.data?.totalItems || 0;

  const handleUsersSort = (field: string) => {
    if (usersSortBy === field) {
      setUsersSortDirection(
        usersSortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC
      );
    } else {
      setUsersSortBy(field);
      setUsersSortDirection(SortDirection.ASC);
    }
    setCurrentUsersPage(0);
  };

  const handleUsersPageChange = (page: number) => {
    setCurrentUsersPage(page);
  };

  const handleRefresh = () => {
    refetchRole();
    refetchUsers();
  };

  const handleDeleteRole = async () => {
    if (!role) return;

    try {
      toast.loading("Deleting role...", { id: "deleting-role" });

      const response = await deleteRole(role.id);

      if (response.success) {
        toast.success(response.message || "Role deleted successfully");
        router.push("/admin/roles");

        // Invalidate all role queries
        queryClient.invalidateQueries({
          queryKey: roleQueries.all(),
        });
      } else {
        toast.error(response.message || "Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("An error occurred while deleting the role");
    } finally {
      toast.dismiss("deleting-role");
      setIsConfirmDialogOpen(false);
    }
  };

  const handleRoleSuccess = () => {
    refetchRole();
  };

  if (isNaN(roleId)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/roles")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Roles
            </Button>
          </div>
        </div>
        <ErrorMessage error="Invalid role ID" />
      </div>
    );
  }

  if (roleError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/roles")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Roles
            </Button>
          </div>
        </div>
        <ErrorMessage error={roleErrorData?.message || "Failed to load role data"} />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/roles")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Roles
            </Button>
          </div>
        </div>
        <ErrorMessage error="Role not found" />
      </div>
    );
  }

  const userColumns: ColumnDef<UserDto>[] = [
    {
      key: "id",
      title: "ID",
      sortable: true,
      render: (user: UserDto) => <span className="text-muted-foreground text-sm">#{user.id}</span>,
      className: "w-16",
    },
    {
      key: "username",
      title: "Username",
      sortable: true,
      render: user => (
        <Link
          href={`/admin/users/${user.id}`}
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        >
          {user.username}
        </Link>
      ),
    },
    {
      key: "active",
      title: "Status",
      sortable: true,
      render: user => (
        <Badge variant={user.active ? "default" : "secondary"}>
          {user.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const userActions: ActionButton<UserDto>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (user: UserDto) => router.push(`/admin/users/${user.id}`),
      variant: "ghost",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/roles")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roles
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Details</h1>
            <p className="text-muted-foreground">Detailed information and users for {role.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRoleDialogOpen(true)}
            className="gap-2"
            disabled={role.isSystemRole}
          >
            <Edit className="h-4 w-4" />
            Edit Role
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsConfirmDialogOpen(true)}
            className="gap-2"
            disabled={role.isSystemRole}
          >
            <Trash2 className="h-4 w-4" />
            Delete Role
          </Button>
          <LastUpdated onRefresh={handleRefresh} resetTrigger={fetchTrigger} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Information
            </CardTitle>
          </CardHeader>
          {roleLoading ? (
            <CardContent className="space-y-4">
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
            </CardContent>
          ) : (
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role ID</span>
                <span className="text-sm font-medium">#{role.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium">{role.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant={role.isSystemRole ? "destructive" : "default"}>
                  {role.isSystemRole ? "SYSTEM" : "CUSTOM"}
                </Badge>
              </div>
              {role.description && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Description</span>
                  <p className="text-sm">{role.description}</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions ({role.permissions.length})
            </CardTitle>
          </CardHeader>

          {roleLoading ? (
            <CardContent className="space-x-2 space-y-2 max-h-40">
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
            </CardContent>
          ) : (
            <CardContent>
              <div className="space-x-2 space-y-2 max-h-40 overflow-y-auto">
                {role.permissions && role.permissions.length > 0 ? (
                  role.permissions.map((permission, index) => (
                    <PermissionBadge key={index} permission={permission} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No permissions assigned to this role
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users with this Role
              </CardTitle>
              <CardDescription>
                Users that have been assigned this role ({totalUsers} total)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <Card>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : usersError ? (
            <ErrorMessage error="Failed to load users for this role" />
          ) : (
            <DataTable
              data={roleUsers}
              columns={userColumns as ColumnDef<unknown>[]}
              actions={userActions as ActionButton<unknown>[]}
              sortBy={usersSortBy}
              sortDirection={usersSortDirection}
              onSort={handleUsersSort}
              currentPage={currentUsersPage}
              pageSize={pageSize}
              totalItems={totalUsers}
              onPageChange={handleUsersPageChange}
              getRowKey={(user: UserDto) => user.id}
              emptyStateIcon={<Users className="h-12 w-12 text-muted-foreground" />}
              emptyStateTitle="No users assigned"
              emptyStateDescription="This role has not been assigned to any users yet."
            />
          )}
        </CardContent>
      </Card>

      <RoleDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        role={role}
        isCreateMode={false}
        onSuccess={handleRoleSuccess}
      />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${role.name}"? This action cannot be undone and will remove all associated permissions.`}
        onConfirm={handleDeleteRole}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
