import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { PermissionDetailDto } from "@/lib/types";

interface PermissionBadgeProps {
  permission: PermissionDetailDto;
  onRemove?: () => void;
  variant?: "default" | "secondary" | "outline" | "destructive";
  className?: string;
  showRemove?: boolean;
}

export function PermissionBadge({
  permission,
  onRemove,
  variant = "secondary",
  className = "",
  showRemove = false,
}: PermissionBadgeProps) {
  const getPermissionLabel = (permission: PermissionDetailDto) => {
    if (!permission.schemaName) {
      return `${permission.permissionType} on All`;
    }

    if (!permission.tableName && !permission.viewName) {
      return `${permission.permissionType} on Schema: ${permission.schemaName}`;
    }

    if (permission.tableName && !permission.viewName) {
      return `${permission.permissionType} on Table: ${permission.schemaName}.${permission.tableName}`;
    }

    if (permission.viewName && !permission.tableName) {
      return `${permission.permissionType} on View: ${permission.schemaName}.${permission.viewName}`;
    }

    // fallback for cases where both table and view are present (should not happen)
    return `${permission.permissionType}`;
  };

  return (
    <Badge variant={variant} className={`gap-2 ${className}`}>
      {getPermissionLabel(permission)}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
          title="Remove permission"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}
