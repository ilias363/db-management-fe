"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { UserDto, SortDirection, UserStats } from "@/lib/types";

import { UserStatsCards, UserTable, UserDialog } from "@/components/user";
import { ConfirmDialog, LastUpdated, ErrorMessage, ExportButton } from "@/components/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toggleUserStatus } from "@/lib/actions";
import { useUsersData, useAllRoles, useExportUsers } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export function UsersPageContent() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active">("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);

  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<UserDto | null>(null);

  const [fetchTrigger, setFetchTrigger] = useState(0);
  const prevFetchingRef = useRef(false);

  const {
    data: usersResponse,
    isLoading: usersLoading,
    isError: usersError,
    error: usersErrorData,
    refetch: refetchUsers,
    isFetching: usersFetching,
  } = useUsersData({
    page: currentPage,
    size: pageSize,
    sortBy,
    sortDirection,
    search: searchTerm || undefined,
    activeOnly: statusFilter === "active",
  });

  const { data: rolesResponse, isError: rolesError } = useAllRoles();
  const { exportUsers, exporting: exportingUsers } = useExportUsers();

  useEffect(() => {
    if (prevFetchingRef.current && !usersFetching) {
      setFetchTrigger(prev => prev + 1);
    }
    prevFetchingRef.current = usersFetching;
  }, [usersFetching]);

  const users = usersResponse?.data?.users?.items || [];
  const totalUsers = usersResponse?.data?.users?.totalItems || 0;
  const stats = usersResponse?.data?.stats;
  const roles = rolesResponse?.data || [];

  const handleToggleUserStatus = (user: UserDto) => {
    setUserToToggle(user);
    setIsConfirmOpen(true);
  };

  const confirmToggleUserStatus = async () => {
    if (!userToToggle) return;

    try {
      const result = await toggleUserStatus(userToToggle.id, userToToggle.active);

      if (result.success) {
        toast.success(result.message);
        refetchUsers();
        setFetchTrigger(prev => prev + 1);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : "Failed to update user status",
      });
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
    refetchUsers();
  };

  const handleSuccess = () => {
    refetchUsers();
  };

  if (usersError || rolesError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">Manage users and their roles across the system</p>
          </div>
        </div>
        <ErrorMessage
          error={usersErrorData?.message || "There was an error loading the users data"}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users and their roles across the system</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton onExport={exportUsers} resourceName="users" disabled={exportingUsers} />
          <Button size="sm" className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Create User
          </Button>
          <LastUpdated onRefresh={handleRefresh} resetTrigger={fetchTrigger} />
        </div>
      </div>

      <UserStatsCards stats={stats || ({} as UserStats)} />

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by username..."
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
          <CardDescription>
            A list of all users in the system with their roles and status
          </CardDescription>
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
          ) : (
            <UserTable
              users={users}
              onEditUser={openEditDialog}
              onToggleUserStatus={handleToggleUserStatus}
              onViewUser={user => router.push(`/admin/users/${user.id}`)}
              onDeleteUser={() => toast.info("Delete user not implemented yet")}
              searchTerm={searchTerm}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalUsers}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={editingUser}
        roles={roles}
        isCreateMode={isCreateMode}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={`${userToToggle?.active ? "Deactivate" : "Activate"} User`}
        description={`Are you sure you want to ${
          userToToggle?.active ? "deactivate" : "activate"
        } ${userToToggle?.username}? ${
          userToToggle?.active
            ? "This will prevent them from accessing the system."
            : "This will allow them to access the system again."
        }`}
        onConfirm={confirmToggleUserStatus}
        confirmText={userToToggle?.active ? "Deactivate" : "Activate"}
        variant="destructive"
      />
    </div>
  );
}
