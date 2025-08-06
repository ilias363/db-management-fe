import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { UserDto, RoleDto } from "@/lib/types";
import { useActionState } from "react";
import { createUser, updateUser } from "@/lib/actions/user";
import ErrorMessage from "@/components/common/error-message";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { getStateFieldErrors, getStateGeneralErrors } from "@/lib/utils";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto | null;
  roles: RoleDto[];
  isCreateMode: boolean;
  onSuccess: () => void;
}

interface FormData {
  username: string;
  password: string;
  active: boolean;
  selectedRoleIds: number[];
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  roles,
  isCreateMode,
  onSuccess,
}: UserDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    active: true,
    selectedRoleIds: [],
  });

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const isSystemAdmin = user?.roles?.some(role => role.name.toUpperCase() === "ADMIN");
  const actionFn = isCreateMode ? createUser : updateUser;
  const [state, action, pending] = useActionState(actionFn, undefined);

  const checkForChanges = useCallback(() => {
    if (!user && isCreateMode) {
      return (
        formData.username !== "" ||
        formData.password !== "" ||
        formData.active !== true ||
        formData.selectedRoleIds.length > 0
      );
    }

    if (user && !isCreateMode) {
      const currentRoleIds = user.roles?.map(r => r.id).sort() || [];
      const selectedRoleIds = formData.selectedRoleIds.sort();

      return (
        formData.username !== user.username ||
        formData.active !== user.active ||
        JSON.stringify(currentRoleIds) !== JSON.stringify(selectedRoleIds)
      );
    }

    return false;
  }, [formData, user, isCreateMode]);

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

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (user && !isCreateMode) {
        const initialData: FormData = {
          username: user.username,
          password: "",
          active: user.active,
          selectedRoleIds: user.roles?.map(r => r.id) || [],
        };
        setFormData(initialData);
      } else {
        const initialData: FormData = {
          username: "",
          password: "",
          active: true,
          selectedRoleIds: [],
        };
        setFormData(initialData);
      }

      setHasChanges(false);

      // Auto-focus username input in create mode
      if (isCreateMode) {
        setTimeout(() => usernameInputRef.current?.focus(), 100);
      }
    }
  }, [user, isCreateMode, open]);

  const getFieldErrors = useCallback((field: string) => getStateFieldErrors(field, state), [state]);

  const getGeneralErrors = useCallback(() => getStateGeneralErrors(state), [state]);

  // Role selection handlers
  const handleRoleChange = useCallback((roleId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedRoleIds: checked
        ? [...prev.selectedRoleIds, roleId]
        : prev.selectedRoleIds.filter(id => id !== roleId),
    }));
  }, []);

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

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? "Create New User" : `Edit User: ${user?.username}`}
            </DialogTitle>
            <DialogDescription>
              {isCreateMode
                ? "Create a new user account with assigned roles."
                : "Update user information and role assignments."}
            </DialogDescription>
          </DialogHeader>

          <form action={action} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {getGeneralErrors() && <ErrorMessage error={getGeneralErrors()} />}

              <div className="grid gap-4">
                {!isCreateMode && user && (
                  <Input id="id" name="id" defaultValue={user.id.toString()} hidden />
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    ref={usernameInputRef}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                    required
                    disabled={isSystemAdmin}
                    className={getFieldErrors("username") ? "border-red-500" : ""}
                  />
                  {getFieldErrors("username") && (
                    <ErrorMessage error={getFieldErrors("username")} />
                  )}
                  {isSystemAdmin && (
                    <p className="text-xs text-muted-foreground">
                      System admin username cannot be modified
                    </p>
                  )}
                </div>

                {isCreateMode && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      required
                      className={getFieldErrors("password") ? "border-red-500" : ""}
                    />
                    {getFieldErrors("password") && (
                      <ErrorMessage error={getFieldErrors("password")} />
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    name="active"
                    checked={formData.active}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, active: !!checked }))
                    }
                    value="true"
                    disabled={isSystemAdmin}
                  />
                  <Label htmlFor="active">Active User</Label>
                  {isSystemAdmin && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (System admin status cannot be changed)
                    </span>
                  )}
                </div>
              </div>

              {/* Hidden inputs for form submission */}
              {formData.selectedRoleIds.map(roleId => (
                <input key={roleId} type="hidden" name="roleIds" value={roleId} />
              ))}

              <Card className="py-3">
                <CardHeader>
                  <CardTitle className="text-lg">Role Assignment</CardTitle>
                  <CardDescription>
                    Select the roles to assign to this user. Roles determine what actions the user
                    can perform.
                  </CardDescription>
                  {getFieldErrors("roles") && <ErrorMessage error={getFieldErrors("roles")} />}
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {roles
                      .sort((r1, r2) => r1.id - r2.id)
                      .map(role => {
                        const isSystemRole =
                          role.name.toUpperCase() === "ADMIN" ||
                          role.name.toUpperCase() === "VIEWER";
                        const isCurrentlyAdmin =
                          role.name.toUpperCase() === "ADMIN" && isSystemAdmin;
                        const isSelected = formData.selectedRoleIds.includes(role.id);

                        return (
                          <div
                            key={role.id}
                            className="flex items-center space-x-3 p-2 border rounded-lg"
                          >
                            <Checkbox
                              id={`role-${role.id}`}
                              checked={isSelected}
                              onCheckedChange={checked => handleRoleChange(role.id, !!checked)}
                              disabled={isCurrentlyAdmin}
                            />
                            <div className="grid gap-1.5 leading-none flex-1">
                              <label
                                htmlFor={`role-${role.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                              >
                                {role.name}
                                {isSystemRole && (
                                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                    System Role
                                  </span>
                                )}
                              </label>
                              <p className="text-xs text-muted-foreground">
                                {role.description || "No description"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="gap-2 flex-shrink-0 border-t pt-4 mt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : isCreateMode ? "Create User" : "Save Changes"}
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
