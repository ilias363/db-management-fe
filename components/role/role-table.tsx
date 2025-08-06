import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Shield, Trash2 } from "lucide-react";
import type { RoleDto, SortDirection } from "@/lib/types";
import { DataTable, type ColumnDef, type ActionButton } from "@/components/common/data-table";
import Link from "next/link";

interface RoleTableProps {
  roles: RoleDto[];
  onViewRole: (role: RoleDto) => void;
  onEditRole: (role: RoleDto) => void;
  onDeleteRole: (role: RoleDto) => void;
  searchTerm: string;
  sortBy: string;
  sortDirection: SortDirection;
  onSort: (field: string) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function RoleTable({
  roles,
  onViewRole,
  onEditRole,
  onDeleteRole,
  searchTerm,
  sortBy,
  sortDirection,
  onSort,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}: RoleTableProps) {
  const columns: ColumnDef<RoleDto>[] = [
    {
      key: "id",
      title: "ID",
      sortable: true,
      render: role => <span className="font-mono text-sm">{role.id}</span>,
      className: "w-16",
    },
    {
      key: "name",
      title: "Name",
      sortable: true,
      render: role => (
        <Link
          href={`/admin/roles/${role.id}`}
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        >
          {role.name}
        </Link>
      ),
    },
    {
      key: "description",
      title: "Description",
      render: role => (
        <div className="truncate max-w-xs" title={role.description || "No description"}>
          {role.description ? (
            role.description
          ) : (
            <span className="text-muted-foreground italic">No description</span>
          )}
        </div>
      ),
    },
    {
      key: "type",
      title: "Type",
      render: role => (
        <Badge variant={role.isSystemRole ? "secondary" : "default"}>
          {role.isSystemRole ? "System" : "Custom"}
        </Badge>
      ),
    },
    {
      key: "permissions",
      title: "Permissions",
      render: role => (
        <div className="flex items-center gap-1">
          <span className="text-sm">{role.permissions.length}</span>
          <span className="text-xs text-muted-foreground">
            permission{role.permissions.length !== 1 ? "s" : ""}
          </span>
        </div>
      ),
    },
  ];

  const actions: ActionButton<RoleDto>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: onViewRole,
      variant: "ghost",
    },
    {
      label: "Edit Role",
      icon: <Edit className="h-4 w-4" />,
      onClick: onEditRole,
      variant: "ghost",
      hidden: (role: RoleDto) => role.isSystemRole,
    },
    {
      label: "Delete Role",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDeleteRole,
      variant: "destructive",
      hidden: (role: RoleDto) => role.isSystemRole,
    },
  ];

  return (
    <DataTable
      data={roles}
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
      getRowKey={role => role.id}
      emptyStateIcon={<Shield className="w-12 h-12 text-muted-foreground opacity-50" />}
      emptyStateTitle="No roles found"
      emptyStateDescription="Try adjusting your search criteria or create a new role."
    />
  );
}
