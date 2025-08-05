"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { RoleDto, RoleStats, SortDirection, PaginationParams } from "@/lib/types";

import { RoleStatsCards } from "@/components/role-stats-cards";
import { RoleTable } from "@/components/role-table";
import { RoleDialog } from "@/components/role-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LastUpdated } from "@/components/last-updated";
import { Input } from "@/components/ui/input";
import { getRolesData, deleteRole } from "@/lib/actions";

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [stats, setStats] = useState<RoleStats>({
    totalRoles: 0,
    systemRoles: 0,
    customRoles: 0,
    roleAssignments: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("ASC");
  const [totalRoles, setTotalRoles] = useState(0);

  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleDto | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const loadData = useCallback(
    async (isReload: boolean = false) => {
      try {
        toast.loading("Loading roles data...", { id: "loading-roles" });

        const roleParams: PaginationParams & { search?: string; systemOnly?: boolean } = {
          page: currentPage,
          size: pageSize,
          sortBy: sortBy,
          sortDirection: sortDirection,
        };
        if (searchTerm) roleParams.search = searchTerm;

        const rolesDataResponse = await getRolesData(roleParams);

        if (!rolesDataResponse.success || !rolesDataResponse.data) {
          toast.error(rolesDataResponse.message);
          return;
        }

        const { roles: rolesResponse, stats: statsResponse } = rolesDataResponse.data;

        if (rolesResponse) {
          setRoles(rolesResponse.items);
          setTotalRoles(rolesResponse.totalItems || rolesResponse.items.length);
        }

        if (statsResponse) {
          setStats(statsResponse);
        }

        setTimeout(() => {
          toast.dismiss("loading-roles");
        }, 500);

        if (isReload) toast.success("Roles data reloaded successfully");
        setResetTrigger(prev => prev + 1);
      } catch (error) {
        console.error("Failed to load data:", error);
        setTimeout(() => {
          toast.dismiss("loading-roles");
        }, 500);
        toast.error("Failed to load roles data");
      }
    },
    [searchTerm, currentPage, pageSize, sortBy, sortDirection]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        loadData(true);
        setResetTrigger(prev => prev + 1);
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
      setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortDirection("ASC");
    }
  };

  const handlePageChange = (page: number) => {
    setRoles([]);
    setCurrentPage(page);
  };

  return (
    <div className="p-6 space-y-6">
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
          <LastUpdated onRefresh={() => loadData(true)} resetTrigger={resetTrigger} />
        </div>
      </div>

      <RoleStatsCards stats={stats} />

      <div className="flex items-center gap-2">
        <div className="relative ">
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
          <RoleTable
            roles={roles}
            onViewRole={() => toast.info("View role not implemented yet")}
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
        </CardContent>
      </Card>

      <RoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role={editingRole}
        isCreateMode={isCreateMode}
        onSuccess={loadData}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone and will remove all associated permissions.`}
        onConfirm={confirmDeleteRole}
        confirmText="Delete"
      />
    </div>
  );
}
