import { Badge } from "@/components/ui/badge";
import { Users, Power, PowerOff, Edit, Eye, Trash2 } from "lucide-react";
import type { SortDirection, UserDto } from "@/lib/types";
import { DataTable, type ColumnDef, type ActionButton } from "@/components/data-table";
import Link from "next/link";

interface UserTableProps {
  users: UserDto[];
  onViewUser: (user: UserDto) => void;
  onEditUser: (user: UserDto) => void;
  onToggleUserStatus: (user: UserDto) => void;
  onDeleteUser: (user: UserDto) => void;
  searchTerm: string;
  sortBy: string;
  sortDirection: SortDirection;
  onSort: (field: string) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function UserTable({
  users,
  onViewUser,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
  searchTerm,
  sortBy,
  sortDirection,
  onSort,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}: UserTableProps) {
  const columns: ColumnDef<UserDto>[] = [
    {
      key: "id",
      title: "ID",
      sortable: true,
      render: user => <span className="text-muted-foreground text-sm">#{user.id}</span>,
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
      className: "w-24",
    },
    {
      key: "roles",
      title: "Roles",
      render: user => (
        <div className="flex flex-wrap gap-1">
          {user.roles.length > 0 ? (
            user.roles.map(role => (
              <Badge key={role.id} variant="outline" className="text-xs">
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No roles</span>
          )}
        </div>
      ),
    },
  ];

  const actions: ActionButton<UserDto>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: onViewUser,
      variant: "ghost",
    },
    {
      label: "Edit User",
      icon: <Edit className="h-4 w-4" />,
      onClick: onEditUser,
      variant: "ghost",
      hidden: (user: UserDto) => user.roles.some(role => role.name === "ADMIN"),
    },
    {
      label: (user: UserDto) => (user.active ? "Deactivate" : "Activate"),
      icon: (user: UserDto) =>
        user.active ? (
          <PowerOff className="h-4 w-4 text-destructive" />
        ) : (
          <Power className="h-4 w-4 text-green-600" />
        ),
      onClick: onToggleUserStatus,
      variant: "ghost",
      hidden: (user: UserDto) => user.roles.some(role => role.name === "ADMIN"),
    },
    {
      label: "Delete User",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDeleteUser,
      variant: "destructive",
      hidden: (user: UserDto) => user.roles.some(role => role.name === "ADMIN"),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      actions={actions}
      searchTerm={searchTerm}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      currentPage={currentPage}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={onPageChange}
      getRowKey={user => user.id}
      emptyStateIcon={<Users className="w-12 h-12 text-muted-foreground opacity-50" />}
      emptyStateTitle="No users found"
      emptyStateDescription="Try adjusting your search criteria or create a new user."
    />
  );
}
