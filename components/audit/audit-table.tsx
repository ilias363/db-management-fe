import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import type { SortDirection, AuditLogDto } from "@/lib/types";
import { DataTable, type ColumnDef, type ActionButton } from "@/components/common";
import Link from "next/link";

interface AuditTableProps {
  audits: AuditLogDto[];
  onViewAudit: (audit: AuditLogDto) => void;
  onDeleteAudit: (audit: AuditLogDto) => void;
  searchTerm: string;
  sortBy: string;
  sortDirection: SortDirection;
  onSort: (field: string) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function AuditTable({
  audits,
  onViewAudit,
  onDeleteAudit,
  searchTerm,
  sortBy,
  sortDirection,
  onSort,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}: AuditTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const columns: ColumnDef<AuditLogDto>[] = [
    {
      key: "id",
      title: "ID",
      sortable: true,
      render: audit => <span className="text-muted-foreground text-sm">#{audit.id}</span>,
      className: "w-16",
    },
    {
      key: "user",
      title: "User",
      sortable: true,
      render: audit => {
        if (audit.user) {
          return (
            <Link
              href={`/admin/users/${audit.user.id}`}
              className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              {audit.user.username}
            </Link>
          );
        }
        return <span className="text-muted-foreground text-sm italic">null</span>;
      },
    },
    {
      key: "actionType",
      title: "Action",
      sortable: true,
      render: audit => (
        <Badge variant="outline" className="text-xs">
          {formatActionType(audit.actionType)}
        </Badge>
      ),
    },
    {
      key: "successful",
      title: "Status",
      sortable: true,
      render: audit => (
        <div className="flex items-center gap-2">
          {audit.successful ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <Badge variant={audit.successful ? "default" : "destructive"}>
            {audit.successful ? "Success" : "Failed"}
          </Badge>
        </div>
      ),
      className: "w-32",
    },
    {
      key: "auditTimestamp",
      title: "Timestamp",
      sortable: true,
      render: audit => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatDate(audit.auditTimestamp)}
        </div>
      ),
      className: "w-48",
    },
    {
      key: "schemaName",
      title: "Schema",
      sortable: true,
      render: audit => {
        if (audit.schemaName) {
          return <span className="text-sm">{audit.schemaName}</span>;
        }
        return <span className="text-muted-foreground text-sm">--</span>;
      },
    },
    {
      key: "tableName",
      title: "Table",
      sortable: true,
      render: audit => {
        if (audit.tableName) {
          return <span className="text-sm">{audit.tableName}</span>;
        }
        return <span className="text-muted-foreground text-sm">--</span>;
      },
    },
    {
      key: "objectName",
      title: "Object",
      render: audit => {
        if (audit.objectName) {
          return <span className="text-sm">{audit.objectName}</span>;
        }
        if (audit.tableName) {
          return (
            <span className="text-sm">
              {audit.schemaName ? `${audit.schemaName}.` : ""}
              {audit.tableName}
            </span>
          );
        }
        if (audit.schemaName) {
          return <span className="text-sm">{audit.schemaName}</span>;
        }
        return <span className="text-muted-foreground text-sm">-</span>;
      },
    },
  ];

  const actions: ActionButton<AuditLogDto>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: onViewAudit,
      variant: "ghost",
    },
    {
      label: "Delete Log",
      icon: <Trash2 className="h-4 w-4 text-destructive" />,
      onClick: onDeleteAudit,
      variant: "ghost",
    },
  ];

  return (
    <DataTable<AuditLogDto>
      data={audits}
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
      emptyStateIcon={<Calendar className="h-12 w-12 text-muted-foreground" />}
      emptyStateTitle="No audit logs found"
      emptyStateDescription="No audit logs match your current filters"
      getRowKey={audit => audit.id.toString()}
    />
  );
}
