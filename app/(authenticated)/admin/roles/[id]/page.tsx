"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Users, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import type { RoleDto, UserDto, SortDirection } from "@/lib/types";
import { getRoleById, getUsersByRole, deleteRole } from "@/lib/actions/role";
import { LastUpdated } from "@/components/common/last-updated";
import { PermissionBadge } from "@/components/common/permission-badge";
import { Separator } from "@/components/ui/separator";
import { RoleDialog } from "@/components/role/role-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, ColumnDef, ActionButton } from "@/components/common/data-table";
import Link from "next/link";

export default function RoleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = parseInt(params.id as string, 10);

  const [role, setRole] = useState<RoleDto | null>(null);
  const [roleUsers, setRoleUsers] = useState<UserDto[]>([]);

  const [currentUsersPage, setCurrentUsersPage] = useState(0);
  const [pageSize] = useState(5);
  const [usersSortBy, setUsersSortBy] = useState<string>("username");
  const [usersSortDirection, setUsersSortDirection] = useState<SortDirection>("ASC");
  const [totalUsers, setTotalUsers] = useState(0);

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const loadRoleData = useCallback(async () => {
    try {
      const response = await getRoleById(roleId);
      if (response.success && response.data) {
        setRole(response.data);
      } else {
        toast.error(response.message || "Failed to load role data");
        router.push("/admin/roles");
      }
    } catch (error) {
      console.error("Error loading role data:", error);
      toast.error("An error occurred while loading role data");
      router.push("/admin/roles");
    }
  }, [roleId, router]);

  const loadRoleUsers = useCallback(
    async (isReload: boolean = false) => {
      try {
        if (!isReload) {
          toast.loading("Loading role users...", { id: "loading-role-users" });
        }

        const response = await getUsersByRole(roleId, {
          page: currentUsersPage,
          size: pageSize,
          sortBy: usersSortBy,
          sortDirection: usersSortDirection,
        });

        if (response.success && response.data) {
          setRoleUsers(response.data.items);
          setTotalUsers(response.data.totalItems);
          if (isReload) {
            toast.success("Users reloaded successfully");
          }
          setResetTrigger(prev => prev + 1);
        } else {
          toast.error(response.message || "Failed to load role users");
        }

        setTimeout(() => {
          toast.dismiss("loading-role-users");
        }, 500);
      } catch (error) {
        console.error("Error loading role users:", error);
        toast.error("An error occurred while loading users");
        setTimeout(() => {
          toast.dismiss("loading-role-users");
        }, 500);
      }
    },
    [roleId, currentUsersPage, pageSize, usersSortBy, usersSortDirection]
  );

  useEffect(() => {
    if (!isNaN(roleId)) {
      Promise.all([loadRoleData(), loadRoleUsers()]).finally(() => {
        setResetTrigger(prev => prev + 1);
      });
    } else {
      toast.error("Invalid role ID");
      router.push("/admin/roles");
    }
  }, [roleId, loadRoleData, loadRoleUsers, router]);

  const handleUsersSort = (field: string) => {
    if (usersSortBy === field) {
      setUsersSortDirection(usersSortDirection === "ASC" ? "DESC" : "ASC");
    } else {
      setUsersSortBy(field);
      setUsersSortDirection("ASC");
    }
  };

  const handleUsersPageChange = (page: number) => {
    setCurrentUsersPage(page);
    setRoleUsers([]);
  };

  const handleReload = () => {
    loadRoleUsers(true);
  };

  const handleDeleteRole = async () => {
    if (!role) return;

    try {
      toast.loading("Deleting role...", { id: "deleting-role" });

      const response = await deleteRole(role.id);

      if (response.success) {
        toast.success(response.message || "Role deleted successfully");
        router.push("/admin/roles");
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
      render: (user: UserDto) => (
        <Badge variant={user.active ? "default" : "secondary"}>
          {user.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "roles",
      title: "Roles Count",
      sortable: false,
      render: (user: UserDto) => <span>{user.roles?.length || 0}</span>,
      className: "text-center",
    },
  ];

  const userActions: ActionButton<UserDto>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (user: UserDto) => router.push(`/admin/users/${user.id}`),
      variant: "outline",
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
            <p className="text-muted-foreground">Detailed information about {role?.name || "--"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {role && !role.isSystemRole && (
            <>
              <Button size="sm" className="gap-2" onClick={() => setIsRoleDialogOpen(true)}>
                <Edit className="h-4 w-4" />
                Edit Role
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-2"
                onClick={() => setIsConfirmDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Role
              </Button>
            </>
          )}
          <LastUpdated onRefresh={handleReload} resetTrigger={resetTrigger} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Role ID:</span>
              <span className="font-medium">#{role?.id || "--"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="font-medium">{role?.name || "--"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Type:</span>
              <Badge variant={role?.isSystemRole ? "default" : "outline"}>
                {role?.isSystemRole ? "System Role" : "Custom Role"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Permissions:</span>
              <span className="font-medium">{role?.permissions.length || "--"}</span>
            </div>
            {role?.description && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Description:</span>
                <p className="text-sm">{role.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions
            </CardTitle>
            <CardDescription>Permissions granted by this role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {role && role.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, index) => (
                    <PermissionBadge
                      key={index}
                      permission={permission}
                      variant="outline"
                      className="text-xs"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No permissions assigned to this role
                </p>
              )}
            </div>
          </CardContent>
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
            emptyStateIcon={<Users className="w-12 h-12 text-muted-foreground opacity-50" />}
            emptyStateTitle="No users found"
            emptyStateDescription="No users have been assigned this role yet."
          />
        </CardContent>
      </Card>

      <RoleDialog
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        role={role}
        isCreateMode={false}
        onSuccess={loadRoleData}
      />

      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${role?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteRole}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
