import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { RoleDto, PermissionDetailDto } from "@/lib/types";
import { PermissionType } from "@/lib/types";
import { createRole, updateRole } from "@/lib/actions";
import { useActionState } from "react";
import ErrorMessage from "./error-message";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { PermissionForm } from "./permission-form";
import { ConfirmDialog } from "./confirm-dialog";

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleDto | null;
  isCreateMode: boolean;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
  permissions: PermissionDetailDto[];
}

export function RoleDialog({ open, onOpenChange, role, isCreateMode, onSuccess }: RoleDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    permissions: [],
  });

  const [newPermission, setNewPermission] = useState<PermissionDetailDto>({
    schemaName: "",
    tableName: "",
    viewName: "",
    permissionType: PermissionType.READ,
  });

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const { permissions, addPermission, removePermission, hasPermission, resetPermissions } =
    usePermissions();

  const actionFn = isCreateMode ? createRole : updateRole;
  const [state, action, pending] = useActionState(actionFn, undefined);

  const getPermissionLabel = useCallback((permission: PermissionDetailDto) => {
    const targets = [
      permission.schemaName && `Schema: ${permission.schemaName}`,
      permission.tableName && `Table: ${permission.tableName}`,
      permission.viewName && `View: ${permission.viewName}`,
    ].filter(Boolean);

    return `${permission.permissionType} on ${targets.join(", ") || "All"}`;
  }, []);

  // Check if form has unsaved changes
  const checkForChanges = useCallback(() => {
    if (!role && isCreateMode) {
      return formData.name !== "" || formData.description !== "" || permissions.length > 0;
    }

    if (role && !isCreateMode) {
      return (
        formData.name !== role.name ||
        formData.description !== (role.description || "") ||
        JSON.stringify(permissions) !== JSON.stringify(role.permissions)
      );
    }

    return false;
  }, [formData, permissions, role, isCreateMode]);

  // Update hasChanges when form data changes
  useEffect(() => {
    setHasChanges(checkForChanges());
  }, [checkForChanges]);

  // Handle successful form submission
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setHasChanges(false);
      onOpenChange(false);
      onSuccess();
    }
  }, [state, onOpenChange, onSuccess]);

  useEffect(() => {
    if (open) {
      if (role && !isCreateMode) {
        const initialData = {
          name: role.name,
          description: role.description || "",
          permissions: role.permissions,
        };
        setFormData(initialData);
        resetPermissions(role.permissions);
      } else {
        const initialData = {
          name: "",
          description: "",
          permissions: [],
        };
        setFormData(initialData);
        resetPermissions([]);
      }

      setNewPermission({
        schemaName: "",
        tableName: "",
        viewName: "",
        permissionType: PermissionType.READ,
      });

      setHasChanges(false);

      // Auto-focus name input in create mode
      if (isCreateMode) {
        setTimeout(() => nameInputRef.current?.focus(), 100);
      }
    }
  }, [role, isCreateMode, open, resetPermissions]);

  // Sync permissions with form data
  useEffect(() => {
    setFormData(prev => ({ ...prev, permissions }));
  }, [permissions]);

  // Error handling helpers
  const getFieldErrors = useCallback(
    (field: string): string | string[] | undefined => {
      if (state?.errors && typeof state.errors === "object" && field in state.errors) {
        return state.errors[field as keyof typeof state.errors];
      }
      return undefined;
    },
    [state]
  );

  const getGeneralErrors = useCallback((): string | string[] | undefined => {
    if (state?.errors && typeof state.errors === "object" && "general" in state.errors) {
      return state.errors["general"];
    }
    return undefined;
  }, [state?.errors]);

  const handleAddPermission = useCallback(() => {
    const permission: PermissionDetailDto = {
      schemaName: newPermission.schemaName || null,
      tableName: newPermission.tableName || null,
      viewName: newPermission.viewName || null,
      permissionType: newPermission.permissionType,
    };

    addPermission(permission);

    setNewPermission({
      schemaName: "",
      tableName: "",
      viewName: "",
      permissionType: PermissionType.READ,
    });

    toast.success("Permission added successfully");
  }, [newPermission, addPermission]);

  const handleRemovePermission = useCallback(
    (index: number) => {
      removePermission(index);
      toast.success("Permission removed");
    },
    [removePermission]
  );

  // Dialog close handler with unsaved changes check
  const handleClose = useCallback(() => {
    if (hasChanges) {
      setShowUnsavedWarning(true);
    } else {
      onOpenChange(false);
      if (state?.errors) state.errors = undefined;
    }
  }, [hasChanges, onOpenChange, state]);

  const handleForceClose = useCallback(() => {
    setShowUnsavedWarning(false);
    setHasChanges(false);
    onOpenChange(false);
    if (state?.errors) state.errors = undefined;
  }, [onOpenChange, state]);

  // Memoized permission list for performance
  const permissionBadges = useMemo(
    () =>
      permissions.map((permission, index) => (
        <Badge key={index} variant="secondary" className="gap-2">
          {getPermissionLabel(permission)}
          <button
            type="button"
            onClick={() => handleRemovePermission(index)}
            className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )),
    [permissions, getPermissionLabel, handleRemovePermission]
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? "Create New Role" : `Edit Role: ${role?.name}`}
            </DialogTitle>
            <DialogDescription>
              {isCreateMode
                ? "Create a new role with specific permissions."
                : "Modify the role details and permissions."}
            </DialogDescription>
          </DialogHeader>

          <form action={action} className="space-y-6">
            {getGeneralErrors() && <ErrorMessage error={getGeneralErrors()} />}

            <div className="grid gap-4">
              {!isCreateMode && role && (
                <Input id="id" name="id" defaultValue={role.id.toString()} hidden />
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  ref={nameInputRef}
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter role name"
                  disabled={role?.isSystemRole}
                  required
                  className={getFieldErrors("name") ? "border-red-500" : ""}
                />
                {getFieldErrors("name") && <ErrorMessage error={getFieldErrors("name")} />}
                {role?.isSystemRole && (
                  <p className="text-xs text-muted-foreground">
                    System role names cannot be modified
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter role description (optional)"
                  rows={3}
                  className={`w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${
                    getFieldErrors("description") ? "border-red-500" : ""
                  }`}
                />
                {getFieldErrors("description") && (
                  <ErrorMessage error={getFieldErrors("description")} />
                )}
              </div>
            </div>

            {permissions.map((permission, index) => (
              <input
                key={index}
                type="hidden"
                name="permissions"
                value={JSON.stringify(permission)}
              />
            ))}

            <div className={`space-y-4 ${getFieldErrors("permissions") ? "border-red-500" : ""}`}>
              <Label>Permissions</Label>

              <PermissionForm
                newPermission={newPermission}
                setNewPermission={setNewPermission}
                onAddPermission={handleAddPermission}
                hasPermission={hasPermission}
              />

              {permissions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Current Permissions ({permissions.length})</h4>
                  <div className="flex flex-wrap gap-2">{permissionBadges}</div>
                </div>
              )}

              {permissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No permissions added yet</p>
                  <p className="text-sm">Add permissions using the form above</p>
                </div>
              )}
              {getFieldErrors("permissions") && (
                <ErrorMessage error={getFieldErrors("permissions")} />
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending || permissions.length === 0}>
                {pending ? "Saving..." : isCreateMode ? "Create Role" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close this dialog? All changes will be lost."
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        onConfirm={handleForceClose}
        confirmText="Discard Changes"
        cancelText="Continue Editing"
      />
    </>
  );
}
