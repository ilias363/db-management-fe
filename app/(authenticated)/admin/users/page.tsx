"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { UserDto, NewUserDto, UpdateUserDto, RoleDto, UserStats, SortDirection } from "@/lib/types";

import { UserStatsCards } from "@/components/user-stats-cards";
import { UserTable } from "@/components/user-table";
import { UserDialog } from "@/components/user-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LastUpdated } from "@/components/last-updated";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
    newThisMonth: 0,
    activeUserPercentage: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active">("all");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState<string>("username");
  const [sortDirection, setSortDirection] = useState<SortDirection>("ASC");
  const [totalUsers, setTotalUsers] = useState(0);

  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<UserDto | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const loadData = useCallback(
    async (isReload: boolean = false) => {
      try {
        toast.loading("Loading users data...", { id: "loading-users" });

        const userParams: Record<string, string> = {
          page: currentPage.toString(),
          size: pageSize.toString(),
          sortBy: sortBy,
          sortDirection: sortDirection,
        };
        if (searchTerm) {
          userParams.search = searchTerm;
        }
        const usersResponse =
          statusFilter === "active"
            ? await apiClient.users.getAllActiveUsers(userParams)
            : await apiClient.users.getAllUsers(userParams);

        console.log("Users response:", usersResponse);

        const [rolesResponse, statsResponse] = await Promise.all([
          apiClient.roles.getAllRoles(),
          apiClient.users.getUserStats(),
        ]);

        if (usersResponse.success && usersResponse.data) {
          setUsers(usersResponse.data.items);
          setTotalUsers(usersResponse.data.totalItems || usersResponse.data.items.length);
        }

        if (rolesResponse.success && rolesResponse.data) {
          setRoles(rolesResponse.data.items);
        }

        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }

        setTimeout(() => {
          toast.dismiss("loading-users");
        }, 500);
        if (isReload) toast.success("Users data reloaded successfully");
        setResetTrigger(prev => prev + 1);
      } catch (error) {
        console.error("Failed to load data:", error);
        setTimeout(() => {
          toast.dismiss("loading-users");
        }, 500);
        toast.error("Failed to load users data");
      }
    },
    [searchTerm, statusFilter, currentPage, pageSize, sortBy, sortDirection]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateUser = async (newUser: NewUserDto) => {
    try {
      const response = await apiClient.users.createUser(newUser);
      if (response.success) {
        toast.success("User created successfully");
        loadData(true);
        setResetTrigger(prev => prev + 1);
      } else {
        toast.error(response.message || "Failed to create user");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    }
  };

  const handleUpdateUser = async (updateData: UpdateUserDto) => {
    try {
      const response = await apiClient.users.updateUser(updateData);
      if (response.success) {
        toast.success("User updated successfully");
        loadData(true);
        setResetTrigger(prev => prev + 1);
      } else {
        toast.error(response.message || "Failed to update user");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    }
  };

  const handleUserSave = async (userData: NewUserDto | UpdateUserDto) => {
    if (isCreateMode) {
      await handleCreateUser(userData as NewUserDto);
    } else {
      await handleUpdateUser(userData as UpdateUserDto);
    }
  };

  const handleToggleUserStatus = (user: UserDto) => {
    setUserToToggle(user);
    setIsConfirmOpen(true);
  };

  const confirmToggleUserStatus = async () => {
    if (!userToToggle) return;

    try {
      const response = userToToggle.active
        ? await apiClient.users.deactivateUser(userToToggle.id)
        : await apiClient.users.activateUser(userToToggle.id);

      if (response.success) {
        toast.success(`User ${userToToggle.active ? "deactivated" : "activated"} successfully`);
        loadData(true);
        setResetTrigger(prev => prev + 1);
      } else {
        toast.error(response.message || "Failed to update user status");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user status");
    } finally {
      setIsConfirmOpen(false);
      setUserToToggle(null);
    }
  };

  const openEditDialog = (user: UserDto) => {
    setEditingUser(user);
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingUser(null);
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
    setCurrentPage(page);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm" className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
          <LastUpdated onRefresh={() => loadData(true)} resetTrigger={resetTrigger} />
        </div>
      </div>

      <UserStatsCards stats={stats} />

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            defaultValue={searchTerm}
            onKeyDown={e => {
              if (e.key === "Enter") {
                const target = e.target as HTMLInputElement;
                setCurrentPage(0);
                setSearchTerm(target.value);
              }
            }}
            className="pl-10 w-64"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={val => {
            setCurrentPage(0);
            setStatusFilter(val as "all" | "active");
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Only Active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users in the system with their roles and status</CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            onEditUser={openEditDialog}
            onToggleUserStatus={handleToggleUserStatus}
            searchTerm={searchTerm}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalUsers}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={editingUser}
        roles={roles}
        isCreateMode={isCreateMode}
        onSave={handleUserSave}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={`${userToToggle?.active ? "Deactivate" : "Activate"} User`}
        description={`Are you sure you want to ${userToToggle?.active ? "deactivate" : "activate"} ${
          userToToggle?.username
        }? ${
          userToToggle?.active
            ? "This will prevent them from accessing the system."
            : "This will allow them to access the system again."
        }`}
        onConfirm={confirmToggleUserStatus}
        confirmText={userToToggle?.active ? "Deactivate" : "Activate"}
      />
    </div>
  );
}
