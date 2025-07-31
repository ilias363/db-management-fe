import { Badge } from "@/components/ui/badge";
import { Users, Power, PowerOff, Edit } from "lucide-react";
import type { UserDto } from "@/lib/types";
import { DataTable, type ColumnDef, type ActionButton } from "@/components/data-table";

interface UserTableProps {
  users: UserDto[];
  onEditUser: (user: UserDto) => void;
  onToggleUserStatus: (user: UserDto) => void;
  searchTerm: string;
  showSelection?: boolean;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  onSort?: (field: string) => void;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

export function UserTable({
  users,
  onEditUser,
  onToggleUserStatus,
  searchTerm,
  sortBy,
  sortDirection,
  onSort,
  currentPage = 0,
  pageSize = 10,
  totalItems = 0,
  onPageChange = () => {},
}: UserTableProps) {
  const columns: ColumnDef<UserDto>[] = [
    {
      key: "username",
      title: "Username",
      sortable: true,
      render: user => <span className="font-medium">{user.username}</span>,
    },
    {
      key: "active",
      title: "Status",
      sortable: true,
      render: user => (
        <Badge variant={user.active ? "default" : "secondary"}>{user.active ? "Active" : "Inactive"}</Badge>
      ),
    },
    {
      key: "roles",
      title: "Roles",
      render: user => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map(role => (
            <Badge key={role.id} variant="outline" className="text-xs">
              {role.name}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  const actions: ActionButton<UserDto>[] = [
    {
      label: "Edit User",
      icon: <Edit className="h-4 w-4" />,
      onClick: onEditUser,
      variant: "outline",
      size: "sm",
    },
    {
      label: "Toggle Status",
      icon: user =>
        user.active ? (
          <PowerOff className="h-4 w-4 text-destructive" />
        ) : (
          <Power className="h-4 w-4 text-green-600" />
        ),
      onClick: onToggleUserStatus,
      variant: "outline",
      size: "sm",
      hidden: user => user.roles.some(role => role.name === "ADMIN"),
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
