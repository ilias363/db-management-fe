"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { RoleDto, RoleStats, SortDirection } from "@/lib/types";

import { RoleStatsCards } from "@/components/role/role-stats-cards";
import { RoleTable } from "@/components/role/role-table";
import { RoleDialog } from "@/components/role/role-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { LastUpdated } from "@/components/common/last-updated";
import { Input } from "@/components/ui/input";
import { deleteRole } from "@/lib/actions";
import { useRolesData } from "@/lib/hooks";
import { ErrorMessage } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";

export function RolesPageContent() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);

  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleDto | null>(null);

  const [fetchTrigger, setFetchTrigger] = useState(0);
  const prevFetchingRef = useRef(false);

  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    isError: rolesError,
    error: rolesErrorData,
    refetch: refetchRoles,
    isFetching: rolesFetching,
  } = useRolesData({
    page: currentPage,
    size: pageSize,
    sortBy,
    sortDirection,
    search: searchTerm || undefined,
  });

  useEffect(() => {
    if (prevFetchingRef.current && !rolesFetching) {
      setFetchTrigger(prev => prev + 1);
    }
    prevFetchingRef.current = rolesFetching;
  }, [rolesFetching]);

  const roles = rolesResponse?.data?.roles?.items || [];
  const totalRoles = rolesResponse?.data?.roles?.totalItems || 0;
  const stats = rolesResponse?.data?.stats;

  const handleViewRole = (role: RoleDto) => {
    router.push(`/admin/roles/${role.id}`);
  };

  const handleDeleteRole = (role: RoleDto) => {
    setRoleToDelete(role);
    setIsConfirmOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      const result = await deleteRole(roleToDelete.id);

      if (result.success) {
        toast.success(result.message);
        refetchRoles();
        setFetchTrigger(prev => prev + 1);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : "Failed to delete role",
      });
    } finally {
      setIsConfirmOpen(false);
      setRoleToDelete(null);
    }
  };

  const openEditDialog = (role: RoleDto) => {
    setEditingRole(role);
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingRole(null);
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(
        sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC
      );
    } else {
      setSortBy(field);
      setSortDirection(SortDirection.ASC);
    }
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    refetchRoles();
  };

  const handleSuccess = () => {
    refetchRoles();
  };

  if (rolesError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">
              Manage roles and their permissions across the system
            </p>
          </div>
        </div>
        <ErrorMessage
          error={rolesErrorData?.message || "There was an error loading the roles data"}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage roles and their permissions across the system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm" className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
          <LastUpdated onRefresh={handleRefresh} resetTrigger={fetchTrigger} />
        </div>
      </div>

      <RoleStatsCards stats={stats || ({} as RoleStats)} />

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles by name or description..."
            defaultValue={searchTerm}
            onKeyDown={e => {
              if (e.key === "Enter") {
                const target = e.target as HTMLInputElement;
                setCurrentPage(0);
                setSearchTerm(target.value);
              }
            }}
            className="pl-10 w-96"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>
            A list of all roles in the system with their permissions and type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rolesLoading ? (
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
          ) : (
            <RoleTable
              roles={roles}
              onViewRole={handleViewRole}
              onEditRole={openEditDialog}
              onDeleteRole={handleDeleteRole}
              searchTerm={searchTerm}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalRoles}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      <RoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role={editingRole}
        isCreateMode={isCreateMode}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone and will remove all associated permissions.`}
        onConfirm={confirmDeleteRole}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
