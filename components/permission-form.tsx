import { PermissionDetailDto, PermissionType } from "@/lib/types";
import { AlertTriangle, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const PERMISSION_TYPES = Object.values(PermissionType);

interface PermissionFormProps {
  newPermission: PermissionDetailDto;
  setNewPermission: React.Dispatch<React.SetStateAction<PermissionDetailDto>>;
  onAddPermission: () => void;
  hasPermission: (permission: PermissionDetailDto) => boolean;
}

export function PermissionForm({
  newPermission,
  setNewPermission,
  onAddPermission,
  hasPermission,
}: PermissionFormProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateAndAddPermission = useCallback(() => {
    const newErrors: string[] = [];

    if (!newPermission.schemaName && (newPermission.tableName || newPermission.viewName)) {
      newErrors.push("If schema is not specified, table and view must also be empty");
    }

    if (newPermission.tableName && newPermission.viewName) {
      newErrors.push("Either table or view must be specified, not both");
    }

    // Check for duplicates
    const permissionToAdd: PermissionDetailDto = {
      schemaName: newPermission.schemaName || null,
      tableName: newPermission.tableName || null,
      viewName: newPermission.viewName || null,
      permissionType: newPermission.permissionType,
    };

    if (hasPermission(permissionToAdd)) {
      newErrors.push("This permission already exists");
    }

    // Check for logical conflicts (e.g., DELETE without READ)
    if (newPermission.permissionType !== PermissionType.READ) {
      const readPermission: PermissionDetailDto = {
        ...permissionToAdd,
        permissionType: PermissionType.READ,
      };
      if (!hasPermission(readPermission)) {
        newErrors.push(
          `Consider adding READ permission first for ${newPermission.permissionType} operations`
        );
      }
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      onAddPermission();
    } else {
      // Show first error as toast
      toast.error(newErrors[0]);
    }
  }, [newPermission, hasPermission, onAddPermission]);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h4 className="font-medium">Add Permission</h4>

      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Validation Errors:</span>
          </div>
          <ul className="mt-2 text-sm text-destructive list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schemaName">Schema Name</Label>
          <Input
            id="schemaName"
            value={newPermission.schemaName ?? ""}
            onChange={e => {
              setNewPermission(prev => ({ ...prev, schemaName: e.target.value }));
              setErrors([]);
            }}
            placeholder="Schema name (optional)"
            aria-describedby="schema-help"
          />
          <p id="schema-help" className="text-xs text-muted-foreground">
            Leave empty to apply to all schemas
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tableName">Table Name</Label>
          <Input
            id="tableName"
            value={newPermission.tableName ?? ""}
            onChange={e => {
              setNewPermission(prev => ({ ...prev, tableName: e.target.value }));
              setErrors([]);
            }}
            placeholder="Table name (optional)"
            aria-describedby="table-help"
          />
          <p id="table-help" className="text-xs text-muted-foreground">
            Leave empty to apply to all schema objects
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="viewName">View Name</Label>
          <Input
            id="viewName"
            value={newPermission.viewName ?? ""}
            onChange={e => {
              setNewPermission(prev => ({ ...prev, viewName: e.target.value }));
              setErrors([]);
            }}
            placeholder="View name (optional)"
            aria-describedby="view-help"
          />
          <p id="view-help" className="text-xs text-muted-foreground">
            Leave empty to apply to all schema objects
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="permissionType">Permission Type</Label>
          <select
            id="permissionType"
            value={newPermission.permissionType}
            onChange={e => {
              setNewPermission(prev => ({
                ...prev,
                permissionType: e.target.value as PermissionType,
              }));
              setErrors([]);
            }}
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            aria-describedby="permission-help"
          >
            {PERMISSION_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <p id="permission-help" className="text-xs text-muted-foreground">
            Choose the type of access to grant
          </p>
        </div>
      </div>

      <Button
        type="button"
        onClick={validateAndAddPermission}
        size="sm"
        className="gap-2"
        aria-label="Add new permission"
      >
        <Plus className="h-4 w-4" />
        Add Permission
      </Button>
    </div>
  );
}
